
import { ADD_MEMBERS, MANAGE_EXTENSIONS, MANAGE_MEMBERS, MANAGE_PROJECTS, MANAGE_ROLES, VIEW_EXTENSIONS } from "../../../templates/permissions";
import PBProject from "./project";
import { getOrgExt, createOrgExtFromConfig, getOrgExtRequestComponents, getOrgExtPerms } from "@/lib/exts";
import { orgTemplates } from "@/lib/getTemplates";
import PBUser from "./user";
import Client from "pocketbase";

export default class PBOrg {

  static async get(pbUser, orgId) {
    const org = await pbUser.pb.collection("orgs").getOne(orgId);
    const pbOrg = new PBOrg(pbUser, org);
    const isMember = await pbOrg.isMember(pbUser.getUser().id);
    if (!isMember) throw new Error("You are not a member of this organization");
    return pbOrg;
  }

  /**
   * @returns {Promise<PBOrg[]>}
   */
  static async getAllOrgs(pbUser) {
    const orgs = await pbUser.pb.collection("orgs").getFullList();
    return orgs.map((org) => new PBOrg(pbUser, org));
  }

  constructor(pbUser, org) {
    /**
     * @type {PBUser}
     */
    this.pbUser = pbUser;
    /**
     * @type {Client}
     * */
    this.pb = this.pbUser.pb;
    this.org = org;
    this.id = org?.id;
  }

  static async create(pbUser, name, icon, description, org_template) {
    const user = pbUser.getUser();
    const pb = pbUser.pb;

    const org = await pb.collection("orgs").create({
      name,
      description,
      created_by: user.id,
      owner: user.id,
      org_template,
      icon
    });
    const pbOrg = new PBOrg(pbUser, org);
    await pbOrg.addMember(user, []);
    return pbOrg;
  }

  async getOrgTemplate() {
    const orgTempId = this.org.org_template;
    return orgTemplates.find(
      (template) => template.id === orgTempId,
    );
  }

  async edit(name, description, org_template) {
    const hasPermission = await this.iHavePermission("");
    if (!hasPermission)
      throw new Error('You do not have permission to edit this organization');
    return await this.pb.collection('orgs').update(this.id, {
      name,
      description,
      org_template
    });
  }

  async editIcon(file) {
    const hasPermission = await this.iHavePermission("");
    if (!hasPermission)
      throw new Error('You do not have permission to change the icon for this organization');
    return await this.pb.collection('orgs').update(this.id, {
      icon: file
    });
  }

  async delete() {
    const hasPermission = this.isOwner(await this.getMyMember());
    if (!hasPermission)
      throw new Error('You do not have permission to delete this organization');
    return await this.pb.collection('orgs').delete(this.id);
  }

  // -- Roles --

  async createRole(name, is_admin, perms, color) {
    const hasPermission = await this.iHavePermission(MANAGE_ROLES);
    if (!hasPermission)
      throw new Error('You do not have permission to create roles for this organization');
    return await this.pb.collection('org_roles').create({
      org: this.id,
      name: name,
      is_admin: is_admin,
      perms: perms,
      color: color
    });
  }

  async editRole(roleId, name, is_admin, perms, color) {
    const hasPermission = await this.iHavePermission(MANAGE_ROLES);
    if (!hasPermission)
      throw new Error('You do not have permission to edit roles for this organization');

    return await this.pb.collection('org_roles').update(roleId, {
      name: name,
      is_admin: is_admin,
      perms: perms,
      color: color
    });
  }

  async deleteRole(roleId) {
    const hasPermission = await this.iHavePermission(MANAGE_ROLES);
    if (!hasPermission)
      throw new Error('You do not have permission to delete roles for this organization');

    return await this.pb.collection('org_roles').delete(roleId);
  }

  async getAllRoles() {
    return await this.pb.collection('org_roles').getFullList({
      filter: 'org="' + this.id + '"',
    });
  }

  async getRoleFromName(name) {
    try {
      const roles = await this.pb.collection('org_roles').getFullList({
        filter: 'org="' + this.id + '" && name="' + name + '"',
      });
      return roles[0];
    } catch (error) {
      console.trace(error);
      return null;
    }
  }

  // -- Invites --

  async invite(email, roleIds = [], projectIds = [], projecrRoleIds = []) {
    const addMembers = await this.iHavePermission(ADD_MEMBERS);
    const manageMembers = await this.iHavePermission(MANAGE_MEMBERS);
    if (!addMembers && !manageMembers)
      throw new Error('You do not have permission to add members to this organization');

    const isMember = await this.isMemberByEmail(email);
    if (isMember)
      throw new Error('User is already a member of this organization');

    const invites = await this.pb.collection('org_invites').getFullList({
      filter: 'org="' + this.id + '" && email="' + email + '"',
    });
    let invite;
    if (invites[0]) {
      invite = await this.pb.collection('org_invites').update(invites[0].id, {
        roles: roleIds,
        projects: projectIds,
        project_roles: projecrRoleIds,
        status: 'PENDING',
      });
    } else {
      invite = await this.pb.collection('org_invites').create({
        org: this.id,
        email,
        roles: roleIds,
        projects: projectIds,
        project_roles: projecrRoleIds,
        status: 'PENDING',
      });
    }

    //TODO send email

    return invite;
  }

  async getAllInvites() {
    const addMembers = await this.iHavePermission(ADD_MEMBERS);
    const manageMembers = await this.iHavePermission(MANAGE_MEMBERS);
    if (!addMembers && !manageMembers)
      throw new Error('You do not have permission to view invites for this organization');
    return await this.pb.collection('org_invites').getFullList({
      filter: 'org="' + this.id + '" && status!="ACCEPTED"',
      expand: 'roles',
      sort: 'status',
    });
  }

  async deleteInvite(invite) {
    const hasPermission = await this.iHavePermission(ADD_MEMBERS);
    if (!hasPermission)
      throw new Error('You do not have permission to delete invites for this organization');
    return await this.pb.collection('org_invites').delete(invite.id);
  }

  // -- Members --

  async isMemberByEmail(email) {
    const members = await this.pb.collection('org_members').getFullList({
      filter: 'org="' + this.id + '" && user.email="' + email + '"',
    });
    return members.length > 0;
  }

  async isMember(userId) {
    const members = await this.pb.collection('org_members').getFullList({
      filter: 'org="' + this.id + '" && user="' + userId + '"',
    });
    return members.length > 0;
  }

  async addMember(user, roles = []) {
    return await this.pb.collection('org_members').create({
      org: this.id,
      user: user.id,
      roles: roles.map((role) => role.id),
    }, {
      expand: 'user, roles',
    });
  }

  async removeMember(member) {
    const hasPermission = await this.iHavePermission(MANAGE_MEMBERS);
    if (!hasPermission)
      throw new Error('You do not have permission to remove members from this organization');
    return await this.pb.collection('org_members').delete(member.id);
  }

  async editMemberRoles(memberId, roleIds = []) {
    const hasPermission = await this.iHavePermission(MANAGE_MEMBERS);
    if (!hasPermission)
      throw new Error('You do not have permission to edit roles for this organization');

    return await this.pb.collection('org_members').update(memberId, {
      roles: roleIds,
    }, {
      expand: 'user, roles',
    });
  }

  async getAllMembers() {
    const manageMembers = await this.iHavePermission(MANAGE_MEMBERS);
    const addMembers = await this.iHavePermission(ADD_MEMBERS);
    if (!manageMembers && !addMembers)
      throw new Error('You do not have permission to view members for this organization');

    return await this.pb.collection('org_members').getFullList({
      filter: 'org="' + this.id + '"',
      expand: 'user, roles',
    });
  }

  async getMember(memberId) {
    const manageMembers = await this.iHavePermission(MANAGE_MEMBERS);
    const addMembers = await this.iHavePermission(ADD_MEMBERS);
    if (!manageMembers && !addMembers)
      throw new Error('You do not have permission to view members for this organization');

    return await this.pb.collection('org_members').getOne(memberId, {
      expand: 'user, roles',
    });
  }

  async getMyMember() {
    const members = await this.pb.collection('org_members').getFullList({
      filter: `org="${this.id}" && user="${this.pbUser.getUser().id}"`,
      expand: 'user, roles',
    });
    return members[0];
  }

  isOwner(member) {
    return this.org.owner === member.user;
  }

  async hasPermission(memberId, perm) {
    const member = await this.getMember(memberId);
    if (this.isOwner(member)) return true;
    return member.expand.roles?.some((role) => role.perms.includes(perm) || role.is_admin);
  }

  async iHavePermission(perm) {
    const member = await this.getMyMember();
    if (this.isOwner(member)) return true;
    return member.expand.roles?.some((role) => role.perms.includes(perm) || role.is_admin);
  }

  // -- Projects --

  async createProject(name, description, project_template) {
    const pbProj = await PBProject.create(this, name, description, project_template);
    await Promise.all((await this.getAllAddedExtensions()).map(async (ext) => {
      if (ext.onProjectCreated) await ext.onProjectCreated(pbProj);
    }));
    return pbProj;
  }

  async getProject(projectId) {
    return await PBProject.get(this, projectId);
  }

  async getAllProjects() {
    return await PBProject.getAllProjectsForOrg(this);
  }

  async getMyProjectInvites() {
    const member = await this.getMyMember();
    const invites = await PBProject.getInvitesForMember(this, member.id);
    return invites;
  }

  async acceptProjectInvite(inviteId, accepted) {
    const invite = await PBProject.updateInvite(this, inviteId, accepted);
    if (accepted) await new PBProject(this, invite.expand.project)
      .addMember(invite.org_member, invite.expand.roles);
    return invite;
  }

  async getMyProjects() {
    const projects = await PBProject.getAllProjectsForOrg(this);
    return projects
  }

  async getProjectsForMember(memberId) {
    const hasPermission = await this.iHavePermission(MANAGE_PROJECTS);
    if (!hasPermission)
      throw new Error('You do not have permission to view projects for this organization');

    const members = await PBProject.getAllProjectsForOrgMember(this, memberId);
    const invites = await PBProject.getInvitesForMember(this, memberId);
    members.push(...invites);
    return members.map((member) => new PBProject(this, member.expand.project));
  }

  // -- Extensions --

  async getExtPBId(extensionId) {
    const exts = await this.pb.collection('org_extensions').getFullList({
      filter: 'org="' + this.id + '" && extension="' + extensionId + '"',
    });
    return exts[0].id;
  }

  async getExt(extensionId) {
    const exts = await this.pb.collection('org_extensions').getFullList({
      filter: 'org="' + this.id + '" && extension="' + extensionId + '"',
      expand: 'extension',
    });
    return exts[0];
  }

  async addExtension(id, config) {
    const hasPermission = await this.iHavePermission(MANAGE_EXTENSIONS);
    if (!hasPermission)
      throw new Error('You do not have permission to add extensions to this organization');
    const ext = await this.pb.collection('org_extensions').create({
      org: this.id,
      extension: id
    }, { expand: 'extension' });
    return await createOrgExtFromConfig(this, ext.expand.extension, ext.id, config);
  }

  async getAllAddedExtensions() {
    const viewExt = await this.iHavePermission(VIEW_EXTENSIONS);
    const manageExt = await this.iHavePermission(MANAGE_EXTENSIONS);
    if (!viewExt && !manageExt) return [];
    const extensions = await this.pb.collection('org_extensions').getFullList({
      filter: 'org="' + this.id + '"',
      expand: 'extension',
    });
    const exts = await Promise.all(extensions.map(async (ext) => await getOrgExt(this, ext.expand.extension)));
    const results = await Promise.all(
      exts.map(async (ext) => {
        const permissions = await getOrgExtPerms(this.pb, ext.id);
        for (const perm of permissions) {
          if (!(await this.iHavePermission(perm))) {
            return false;
          }
        }
        return true;
      }),
    );
    return exts.filter((_, index) => results[index]);
  }

  async removeExtension(extensionId) {
    const hasPermission = await this.iHavePermission(MANAGE_EXTENSIONS);
    if (!hasPermission)
      throw new Error('You do not have permission to remove extensions from this organization');
    const extPBId = await this.getExtPBId(extensionId);
    return await this.pb.collection('org_extensions').delete(extPBId);
  }

  async getAllExtensionRequestComponents() {
    const exts = await this.pb.collection('org_extensions').getFullList({
      filter: 'org="' + this.id + '"',
      expand: 'extension',
    });
    const components = await Promise.all(exts.map(async (ext) => {
      return await getOrgExtRequestComponents(this, ext.expand.extension);
    }));
    return components.flat().flat();
  }
}
