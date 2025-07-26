import { ADD_PRJ_MEMBERS, CREATE_PROJECTS, CREATE_TASKS, INVITE_FOR_PROJECTS, MANAGE_PRJ_MEMBERS, MANAGE_PRJ_ROLES, MANAGE_PROJECTS, MANAGE_TASKS } from "@/../templates/permissions";
import PBOrg from "./org";
import Client from "pocketbase";
import PBTask from "./task";
import PBNotification from "./notification";
import OpenAI from "openai";
import { OPENAI_API_KEY, TASKS_SUGGESTION_ASSISTANT_ID } from "@/lib/env";
import { getOrgExtProjRequestComponents, createPrjExtFromConfig, getPrjExt, getPrjExtRequestComponents, getPrjExtPerms } from "../exts";

const openAi = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const generateTasksSuggestion = async (pbOrg, pbPrj, tasks) => {
  if (!openAi && !TASKS_SUGGESTION_ASSISTANT_ID) return [];
  console.log("Generating tasks suggestion using Open Ai");
  const thread = await openAi.beta.threads.create();
  const content = JSON.stringify({
    project_name: pbPrj.project.name,
    description: pbPrj.project.description,
    existing_tasks: tasks.map((t) => { return { title: t.task.title, description: t.task.description } })
  });
  await openAi.beta.threads.messages.create(thread.id, {
    role: "user",
    content: content,
  });
  const run = await openAi.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: TASKS_SUGGESTION_ASSISTANT_ID,
  });
  if (run.status === "completed") {
    const messages = await openAi.beta.threads.messages.list(run.thread_id);
    const regex = /```json\n(.*)\n```/s;
    const message = messages.data[0].content[0].text.value.match(regex)[1];
    return JSON.parse(message);
  }
  return [];
};

export default class PBProject {

  /**
   * @returns {Promise<PBProject[]>}
   */
  static async getAllProjectsForOrg(pbOrg) {
    const manageProjects = await pbOrg.iHavePermission(MANAGE_PROJECTS);
    const myOrgMember = await pbOrg.getMyMember();

    const prjs = await pbOrg.pb.collection('projects').getFullList({
      filter: 'org="' + pbOrg.id + '"',
    });

    return (await Promise.all(prjs.map(async (prj) => {
      const project = new PBProject(pbOrg, prj);
      const wasCreatedByMe = project.project.created_by === myOrgMember.id;
      const isMember = await project.isMember(myOrgMember.id);
      const hasPermission = manageProjects || wasCreatedByMe || isMember;
      return { project, hasPermission };
    }))).filter((p) => p.hasPermission).map((p) => p.project);
  }

  static async get(pbOrg, projectId) {
    const project = await pbOrg.pb.collection('projects').getOne(projectId);
    const hasPermission = await pbOrg.iHavePermission(MANAGE_PROJECTS);
    const myOrgMember = await pbOrg.getMyMember();
    const pbProject = new PBProject(pbOrg, project);
    const isMember = await pbProject.isMember(myOrgMember.id);
    if (!hasPermission && !isMember) {
      throw new Error("You don't have permission to view this project");
    }
    return pbProject;
  }

  constructor(pbOrg, project) {
    /**
     * @type {PBOrg}
     * */
    this.pbOrg = pbOrg;
    /**
     * @type {Client}
     * */
    this.pb = pbOrg.pb;
    this.project = project;
    this.id = project.id;
  }

  static async create(pbOrg, name, description, project_template) {
    const pb = pbOrg.pb;
    const member = await pbOrg.getMyMember();

    const createProjects = await pbOrg.iHavePermission(CREATE_PROJECTS);
    const manageProjects = await pbOrg.iHavePermission(MANAGE_PROJECTS);
    const hasPermission = createProjects || manageProjects;
    if (!hasPermission) {
      throw new Error("You don't have permission to create projects");
    }

    const project = await pb.collection("projects").create({
      name,
      description,
      project_template,
      org: pbOrg.id,
      created_by: member.id
    });
    const pbProject = new PBProject(pbOrg, project);
    await pbProject.addMember(member.id, []);
    return pbProject;
  }

  async edit(name, description, project_template) {
    const hasPermission = await this.iHavePermission("");
    if (!hasPermission) {
      throw new Error("You don't have permission to edit projects");
    }
    return await this.pb.collection('projects').update(this.id, {
      name,
      description,
      project_template
    });
  }

  async delete() {
    const hasPermission = await this.iHavePermission("");
    if (!hasPermission) {
      throw new Error("You don't have permission to delete projects");
    }
    return await this.pb.collection('projects').delete(this.id);
  }

  // -- Permissions --

  isOwner(orgMemberId) {
    return this.project.created_by === orgMemberId;
  }

  async iHavePermission(permission) {
    const member = await this.getMyMember();
    if (this.isOwner(member?.org_member)) return true;
    const manageProjects = await this.pbOrg.iHavePermission(MANAGE_PROJECTS);
    if (manageProjects) return true;
    return (member.expand?.roles || []).some((role) => role.perms.includes(permission) || role.is_admin);
  }

  async hasPermission(memberId, permission) {
    const member = await this.getMember(memberId);
    if (this.isOwner(member.org_member)) return true;
    const manageProjects = await this.pbOrg.hasPermission(memberId, MANAGE_PROJECTS);
    if (manageProjects) return true;
    return (member.expand?.roles || []).some((role) => role.perms.includes(permission) || role.is_admin);
  }

  // -- Roles --

  async createRole(name, is_admin, perms, color) {
    const hasPermission = await this.iHavePermission(MANAGE_PRJ_ROLES);
    if (!hasPermission) throw new Error("You don't have permission to create roles");

    return await this.pb.collection('project_roles').create({
      project: this.id,
      name: name,
      is_admin: is_admin,
      perms: perms,
      color: color
    });
  }

  async editRole(roleId, name, is_admin, perms, color) {
    const hasPermission = await this.iHavePermission(MANAGE_PRJ_ROLES);
    if (!hasPermission) throw new Error("You don't have permission to edit roles");

    return await this.pb.collection('project_roles').update(roleId, {
      name,
      is_admin,
      perms,
      color
    });
  }

  async deleteRole(roleId) {
    const hasPermission = await this.iHavePermission(MANAGE_PRJ_ROLES);
    if (!hasPermission) throw new Error("You don't have permission to delete roles");

    return await this.pb.collection('project_roles').delete(roleId);
  }

  async getAllRoles() {
    return await this.pb.collection('project_roles').getFullList({
      filter: 'project="' + this.id + '"',
    });
  }

  async getRoleForName(name) {
    try {
      const roles = await this.pb.collection('project_roles').getFullList({
        filter: 'project="' + this.id + '" && name="' + name + '"',
      });
      return roles[0];
    } catch (error) {
      console.trace(error);
      return null;
    }
  }

  // -- Invites --

  async createInvite(orgMemberId, roleIds) {
    const addMember = await this.iHavePermission(ADD_PRJ_MEMBERS);
    const manageMembers = await this.iHavePermission(MANAGE_PRJ_MEMBERS);

    if (!addMember && !manageMembers)
      throw new Error("You don't have permission to invite members");

    console.log("id", this.id, "org", orgMemberId);
    const invite = await this.pb.collection('project_invites').create({
      project: this.id,
      org_member: orgMemberId,
      roles: roleIds,
      status: 'PENDING',
    });
    PBNotification.createProjectInviteNotification(this, invite);
    return invite;
  }

  static async updateInvite(pbOrg, inviteId, accepted) {
    return await pbOrg.pb.collection("project_invites").update(inviteId, {
      status: accepted ? "ACCEPTED" : "REJECTED",
    }, { expand: 'project, roles' });
  }

  static async getInvitesForMember(pbOrg, memberId) {
    return await pbOrg.pb.collection('project_invites').getFullList({
      filter: 'org_member="' + memberId + '" && status="PENDING"',
      expand: 'project, roles',
    });
  }

  async getAllInvites() {
    const addMember = await this.iHavePermission(ADD_PRJ_MEMBERS);
    const manageMembers = await this.iHavePermission(MANAGE_PRJ_MEMBERS);
    if (!addMember && !manageMembers)
      throw new Error("You don't have permission to view invites");

    return await this.pb.collection('project_invites').getFullList({
      expand: 'org_member.user, roles',
      filter: `project = "${this.id}" && status != "ACCEPTED"`,
    });
  }

  async getAllPendingInvites() {
    return await this.pb.collection('project_invites').getFullList({
      expand: 'org_member.user, roles',
      filter: 'project="' + this.id + '" && status="PENDING"',
    });
  }

  async getAllRejectedInvites() {
    return await this.pb.collection('project_invites').getFullList({
      expand: 'org_member.user, roles',
      filter: 'project="' + this.id + '" && status="REJECTED"',
    });
  }

  async deleteInvite(invite) {
    const hasPermission = await this.iHavePermission(MANAGE_PRJ_MEMBERS);
    if (!hasPermission)
      throw new Error("You don't have permission to delete invites");
    return await this.pb.collection('project_invites').delete(invite.id);
  }

  async addMemberOrInvite(org_member, rolesId) {
    const addMember = await this.iHavePermission(ADD_PRJ_MEMBERS);
    const manageMembers = await this.iHavePermission(MANAGE_PRJ_MEMBERS);
    if (!addMember && !manageMembers)
      throw new Error("You don't have permission to add members");

    const inviteForProjects = this.pbOrg.hasPermission(org_member.id, INVITE_FOR_PROJECTS);

    if (inviteForProjects) return await this.createInvite(org_member.id, rolesId);
    const member = await this.addMember(org_member.id, rolesId);
    await PBNotification.createProjectAddedNotification(this, member);
    return member;
  }

  // -- Members --

  async isMember(orgMemberId) {
    const members = await this.pb.collection('project_members').getFullList({
      filter: 'project="' + this.id + '" && org_member="' + orgMemberId + '"',
    });
    return members.length > 0;
  }

  static async getAllProjectsForOrgMember(pbOrg, orgMemberId) {
    return await pbOrg.pb.collection('project_members').getFullList({
      filter: 'org_member="' + orgMemberId + '"',
      expand: 'project',
    });
  }

  async addMember(orgMemberId, roles) {
    return await this.pb.collection("project_members").create({
      project: this.id,
      org_member: orgMemberId,
      roles
    });
  }

  async editMemberRoles(memberId, roleIds) {
    const hasPermission = await this.iHavePermission(MANAGE_PRJ_MEMBERS);
    if (!hasPermission) throw new Error("You don't have permission to edit members");

    return await this.pb.collection('project_members').update(memberId, {
      roles: roleIds,
    }, {
      expand: 'org_member.user, roles',
    });
  }

  async removeMember(member) {
    const hasPermission = await this.iHavePermission(MANAGE_PRJ_MEMBERS);
    if (!hasPermission) throw new Error("You don't have permission to remove members");

    await this.pb.collection("project_members").delete(member.id);
  }

  async getAllMembers() {
    return await this.pb.collection('project_members').getFullList({
      expand: 'org_member.user, org_member.roles, roles',
      filter: 'project="' + this.id + '"',
    });
  }

  async getAllMembersAndInvites() {
    const members = await this.getAllMembers();
    const invites = await this.getAllPendingInvites();
    return members.concat(invites);
  }

  async orgMemberHasRole(orgMemberId, role) {
    if (!role) return false;
    const members = await this.pb.collection('project_members').getFullList({
      filter: 'project="' + this.id + '" && org_member="' + orgMemberId + '"',
      expand: 'roles',
    });
    const memberHas = members[0]?.roles.some((r) => r.id === role.id);
    if (memberHas) return true;
    const invite = await this.pb.collection('project_invites').getFullList({
      filter: 'project="' + this.id + '" && org_member="' + orgMemberId + '" && status!="ACCEPTED"',
      expand: 'roles',
    });
    const inviteHas = invite[0]?.roles.some((r) => r.id === role.id);
    if (inviteHas) return true;
    return false;
  }

  async getMyMember() {
    const member = await this.pbOrg.getMyMember();
    const members = await this.pb.collection('project_members').getFullList({
      filter: 'project="' + this.id + '" && org_member="' + member.id + '"',
      expand: 'roles',
    });
    return members[0];
  }

  async getMember(memberId) {
    return await this.pb.collection('project_members').getOne(memberId, {
      expand: 'org_member.user, roles',
    });
  }


  // -- Task Statuses --
  async createStatus(name, description) {
    const hasPermission = await this.iHavePermission(MANAGE_TASKS);
    if (!hasPermission) throw new Error("You don't have permission to create statuses");

    return await this.pb.collection("task_status").create({
      name,
      description,
      project: this.id
    });
  }

  async editStatus(statusId, name, description) {
    const hasPermission = await this.iHavePermission(MANAGE_TASKS);
    if (!hasPermission) throw new Error("You don't have permission to edit statuses");

    return await this.pb.collection("task_status").update(statusId, {
      name,
      description
    });
  }

  async deleteStatus(statusId) {
    const hasPermission = await this.iHavePermission(MANAGE_TASKS);
    if (!hasPermission) throw new Error("You don't have permission to delete statuses");

    return await this.pb.collection("task_status").delete(statusId);
  }

  async getAllStatuses() {
    return await this.pb.collection("task_status").getFullList({
      filter: 'project="' + this.id + '"',
    });
  }

  async editDoneStatus(statusId) {
    const hasPermission = await this.iHavePermission(MANAGE_TASKS);
    if (!hasPermission) throw new Error("You don't have permission to edit done status");
    const statuses = await this.getAllStatuses();
    if (statusId !== undefined && !statuses.some((s) => s.id === statusId)) {
      throw new Error("Status not found");
    }
    return await this.pb.collection("projects").update(this.id, {
      done_status: statusId,
    });
  }

  async getDoneStatus() {
    const project = await this.pb.collection("projects").getOne(this.id);
    const doneStatus = project.done_status;
    if (!doneStatus) return null;
    return await this.pb.collection("task_status").getOne(doneStatus);
  }

  // -- Tasks --
  async createTask(title, description, dueDate, priority, status, assignedToProjectMemberIds, reviewersProjectMemberIds) {
    const task = await PBTask.create(this, title, description, dueDate, priority, status);
    task.editAssignedTo(assignedToProjectMemberIds, false);
    task.editReviewers(reviewersProjectMemberIds, false);
    return task;
  }

  async getAllTasks() {
    return await PBTask.getAll(this);
  }

  async getMyTasks() {
    return await PBTask.getMyTasks(this);
  }

  async suggestTasks() {
    const createTasks = await this.iHavePermission(CREATE_TASKS);
    const manageTasks = await this.iHavePermission(MANAGE_TASKS);
    if (!createTasks && !manageTasks) throw new Error("You don't have permission to get tasks suggestions");

    return await generateTasksSuggestion(this.pbOrg, this, await this.getAllTasks());
  }

  // -- Extensions --

  async getAllExtensionRequestComponents() {
    const orgExts = await this.pb.collection('org_extensions').getFullList({
      filter: 'org="' + this.pbOrg.id + '"',
      expand: 'extension',
    });
    const orgExtComps = await Promise.all(
      orgExts.flatMap(async (ext) => {
        return await getOrgExtProjRequestComponents(
          this.pbOrg,
          ext.expand.extension,
          this,
        );
      }),
    );
    const projExts = await this.getAllAddedExtensions();
    const projExtComps = await Promise.all(projExts.flatMap(async (extObj) => {
      return await getPrjExtRequestComponents(extObj);
    }));
    return orgExtComps + projExtComps;
  }

  async getExtPBId(extensionId) {
    const exts = await this.pb.collection('project_extensions').getFullList({
      filter: 'project="' + this.id + '" && extension="' + extensionId + '"',
    });
    return exts[0].id;
  }

  async addExtension(id, config) {
    const hasPermission = await this.iHavePermission("");
    if (!hasPermission)
      throw new Error('You do not have permission to add extensions to this organization');
    const ext = await this.pb.collection('project_extensions').create({
      project: this.id,
      extension: id
    }, { expand: 'extension' });
    return await createPrjExtFromConfig(this, ext.expand.extension, ext.id, config);
  }

  async getAllAddedExtensions() {
    const hasPermission = await this.iHavePermission("");
    if (!hasPermission) return [];
    const extensions = await this.pb.collection('project_extensions').getFullList({
      filter: 'project="' + this.id + '"',
      expand: 'extension',
    });
    const exts = await Promise.all(extensions.map(async (ext) => await getPrjExt(this, ext.expand.extension)));
    return exts.filter(async (ext) => {
      const permissions = await getPrjExtPerms(this.pb, ext.id);
      return permissions.every(async (perm) => await this.iHavePermission(perm));
    });
  }

  async removeExtension(extensionId) {
    const hasPermission = await this.iHavePermission("");
    if (!hasPermission)
      throw new Error('You do not have permission to remove extensions from this project');
    const extPBId = await this.getExtPBId(extensionId);
    return await this.pb.collection('project_extensions').delete(extPBId);
  }
}
