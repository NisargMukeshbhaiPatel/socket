import { getServerTranslation } from "@/../i18n/server";
import PBOrg from "@/lib/pb/org";
import Client from "pocketbase";
import OpenAI from "openai";
import MemberSkillRequestCard from "@/(dashboard)/org/[orgId]/extension/AUTO_ALLOCATION/components/request-components/skill-request-card";
import ProjectRequestCard from "@/(dashboard)/org/[orgId]/extension/AUTO_ALLOCATION/components/request-components/project-request-card";
import { OPENAI_API_KEY, AUTO_ALLOCATION_ASSISTANT_ID } from "@/lib/env";
import { MANAGE_MEMBERS, MANAGE_PROJECTS } from "../../../../../../templates/permissions";
import PBProject from "@/lib/pb/project";

const openAi = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
/**
 * @param {string} type PROJECT or USER
 */
const generateSkills = async (type, name, description, skills) => {
  const selectedSkills = [];
  if (openAi && AUTO_ALLOCATION_ASSISTANT_ID) {
    console.log("Generating Skills using Open Ai");
    const thread = await openAi.beta.threads.create();
    const content = JSON.stringify({
      type, name, description, skills: skills.map((skill) => { return { name: skill.title, id: skill.id } })
    });
    await openAi.beta.threads.messages.create(thread.id, {
      role: "user",
      content: content,
    });
    const run = await openAi.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: AUTO_ALLOCATION_ASSISTANT_ID,
    });
    if (run.status === "completed") {
      const messages = await openAi.beta.threads.messages.list(run.thread_id);
      const message = messages.data[0].content[0].text.value;
      message.split("\n").map((line) => {
        const ids = line.split(",").map((item) => item.trim());
        selectedSkills.push(...skills.filter((skill) => ids.includes(skill.id)));
      });
    }
    return selectedSkills;
  } else {
    console.log("No OPENAI_API_KEY or AUTO_ALLOCATION_ASSISTANT_ID found, generating random skills");
    // 2-4 random skills for now
    const numSkills = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numSkills; i++) {
      const skill = skills[Math.floor(Math.random() * skills.length)];
      selectedSkills.push(skill);
    }
    return selectedSkills;
  }
};

export default class AutoAllocation {

  constructor(actualExt, pbOrg, pbId) {
    /**
     * @type {PBOrg}
     * */
    this.pbOrg = pbOrg;
    /**
     * @type {Client}
     * */
    this.pb = pbOrg.pb;
    this.pbId = pbId;
    this.actualExt = actualExt;
    this.id = actualExt.id;
    this.name = "$autoAllocation";
  }

  /**
   * 
   * @param {PBOrg} pbOrg 
   * @param {*} config 
   * @returns 
   */
  static async create(actualExt, pbOrg, pbId, config) {
    const ext = new AutoAllocation(actualExt, pbOrg, pbId);

    const t = await getServerTranslation();

    if (config) {
      let orgRole = null;
      if (config.orgRole) {
        orgRole = (await pbOrg.getRoleFromName(t(config.orgRole))).id;
      }

      await ext.createSettings(
        t(config.reason),
        orgRole,
        t(config.projectRole),
        config.minMembers,
        config.matchMembersWithNoCommonSkills
      );
      for (let skill of config.skills) {
        await ext.createSkill(skill);
      }
    } else {
      const roles = await pbOrg.getAllRoles();
      await ext.createSettings(null, roles[0].id, null, 2, false);
    }

    const projects = await pbOrg.getAllProjects();
    await Promise.all(projects.map(async (project) => {
      await ext.onProjectCreated(project);
    }));

    return ext;
  }

  /**
   * @param {Record} actualExt
   * @param {PBOrg} pbOrg
   * */
  static async getExt(actualExt, pbOrg) {
    if (!actualExt.enabled) return null;
    const pbId = await pbOrg.getExtPBId(actualExt.id);
    return new AutoAllocation(actualExt, pbOrg, pbId);
  }

  static async get(pbOrg) {
    const actualExt = { id: "AUTO_ALLOCATION", enabled: true };
    return await AutoAllocation.getExt(actualExt, pbOrg);
  }

  async getDesc() {
    const settings = await this.getSettings();
    return settings?.reason;
  }

  static requiredPerms() {
    return [MANAGE_MEMBERS, MANAGE_PROJECTS];
  }

  /**
   * 
   * @param {PBProject} pbProj 
   */
  async onProjectCreated(pbProj) {
    await this.createProjectSkill(pbProj.id, []);
  }

  // -- Settings --

  async createSettings(reason, orgRole, projectRole, minMembers = 2, matchMembersWithNoCommonSkills = false) {
    const res = await this.pb.collection('ext_alloc_org_settings').create({
      reason: reason,
      ext: this.pbId,
      assign_role: orgRole,
      project_role_name: projectRole,
      min_members: minMembers,
      match_members_with_no_common_skills: matchMembersWithNoCommonSkills
    });
  }

  async getSettings() {
    const settings = await this.pb.collection('ext_alloc_org_settings').getFullList({
      filter: 'ext="' + this.pbId + '"',
      expand: 'ext.org, assign_role'
    });
    return settings[0];
  }

  async applySettings(
    orgRole,
    projectRole,
    reason,
    minMembers,
    matchNoCommonSkills,
  ) {
    const settings = await this.getSettings();
    return await this.pb
      .collection("ext_alloc_org_settings")
      .update(settings.id, {
        assign_role: orgRole,
        project_role_name: projectRole,
        reason: reason,
        min_members: minMembers,
        match_members_with_no_common_skills: matchNoCommonSkills,
      });
  }

  // -- Skills --

  async createSkill(skillName) {
    return await this.pb.collection('ext_alloc_org_skills').create({
      ext: this.pbId,
      title: skillName
    });
  }

  async deleteSkill(skill) {
    return await this.pb.collection('ext_alloc_org_skills').delete(skill.id);
  }

  async getAllSkills() {
    return await this.pb.collection('ext_alloc_org_skills').getFullList({
      filter: 'ext="' + this.pbId + '"'
    });
  }

  // -- Org Member Skills --

  async requestSkillsFrom(pendingMemberId) {
    return await this.pb.collection('ext_alloc_org_member_skills').create({
      ext: this.pbId,
      org_member: pendingMemberId,
      max_projects: 2,
    });
  }

  async getMySkillRequest() {
    const orgMember = await this.pbOrg.getMyMember();
    const reqs = await this.pb.collection('ext_alloc_org_member_skills').getFullList({
      filter: 'org_member="' + orgMember.id + '"',
      expand: 'org_member.org, org_member.user, org_member.roles, skills'
    });
    return reqs[0];
  }

  async getMyRequestComponent() {
    const [request, allSkills] = await Promise.all([
      this.getMySkillRequest(),
      this.getAllSkills(),
    ]);
    if (!request) return;
    return (
      <MemberSkillRequestCard
        key={request.id}
        request={{
          id: request.id,
          skills: request.expand.skills?.map(skill => ({ id: skill.id, title: skill.title })) || [],
          data: request.data,
          maxProjects: request.max_projects,
          roles: request.expand.org_member.expand.roles,
          name: request.expand.org_member.custom_name || request.expand.org_member.expand.user.name,
        }}
        allSkills={allSkills?.map(skill => ({ id: skill.id, title: skill.title })) || []}
        orgId={this.pbOrg.id}
      />
    )
  }

  async fillSkills(skillRequestId, data, skillIds, maxProjects) {
    return await this.pb.collection('ext_alloc_org_member_skills').update(skillRequestId, {
      data: data,
      skills: skillIds,
      max_projects: maxProjects
    });
  }

  async generateUserSkills(userName, userData) {
    const skills = await this.getAllSkills();
    const newSkills = await generateSkills("USER", userName, userData, skills);
    return newSkills;
  }

  async getAllMemberRequests() {
    return await this.pb.collection('ext_alloc_org_member_skills').getFullList({
      filter: 'org_member.org.id="' + this.pbOrg.id + '"',
      expand: 'org_member.user, org_member.roles, skills'
    });
  }

  async getAllFilledRequests() {
    return await this.pb.collection('ext_alloc_org_member_skills').getFullList({
      filter: 'org_member.org.id="' + this.pbOrg.id + '" && skills:length > 0',
      expand: 'org_member.user, org_member.roles, skills'
    });
  }

  async getAllRequests() {
    const allMembers = await this.pbOrg.getAllMembers();
    const roleId = (await this.getSettings())?.assign_role;
    if (!roleId) throw new Error("Assign Role not found");

    const allReqs = await this.getAllMemberRequests();
    return allMembers.filter((member) => {
      return member.roles.includes(roleId);
    }).map((member) => {
      const found = allReqs.find((skillMember) => skillMember.org_member === member.id);
      return { member, found };
    })
  }

  // -- Project Skills --

  async getAllRequestsWithProjects() {
    const all = await this.getAllFilledRequests();
    const settings = await this.getSettings();
    const members = await Promise.all(all.map(async (request) => {
      const projects = await this.pbOrg.getProjectsForMember(request.org_member);
      const alreadyAssignedProjects = projects.filter((project) => {
        const role = project.getRoleForName(settings.project_role_name);
        return project.orgMemberHasRole(request.org_member, role);
      });
      return { request, alreadyAssignedProjects };
    }))
    return members.filter((member) => {
      const maxProjects = member.request.max_projects || 0;
      return maxProjects > member.alreadyAssignedProjects.length;
    });
  }

  async createProjectSkill(projectId, skillIds) {
    return await this.pb.collection('ext_alloc_project_skills').create({
      ext: this.pbId,
      project: projectId,
      skills: skillIds
    });
  }

  async getProjectSkills(projectSkillId) {
    return await this.pb.collection('ext_alloc_project_skills').get(projectSkillId, {
      expand: 'project, skills'
    });
  }

  async updateProjectSkill(projectSkillId, skillIds) {
    return await this.pb.collection('ext_alloc_project_skills').update(projectSkillId, {
      skills: skillIds
    });
  }

  async generateProjectSkills(projectSkillId, projectName, projectDescription) {
    const skills = await this.getAllSkills();
    const newSkills = await generateSkills("PROJECT", projectName, projectDescription, skills);
    return await this.updateProjectSkill(projectSkillId, newSkills.filter((i) => i).map((i) => i.id));
  }

  async getProjectsWithSkills(projects) {
    return Promise.all(projects.map(async (unassigned) => {
      const project = unassigned.project;
      const projectSkills = (await this.pb.collection('ext_alloc_project_skills').getFullList({
        filter: 'project="' + project.id + '"',
        expand: 'skills'
      }))[0];
      const skills = projectSkills?.expand?.skills || [];

      return { unassigned: unassigned, skills, projectSkillId: projectSkills?.id };
    }));
  }

  async getAllUnassignedProjects() {
    const all = await this.pbOrg.getAllProjects();
    const settings = await this.getSettings();
    const projectRole = settings.project_role_name;
    const minAssignees = settings.min_members;

    const projectsWithSkills = await this.getProjectsWithSkills(all);

    const unassigned = [];
    for (let withSkills of projectsWithSkills) {
      const members = await withSkills.unassigned.getAllMembersAndInvites();
      const role = await withSkills.unassigned.getRoleForName(projectRole);
      if (!role) continue;
      const alreadyAssignedMembers = members.filter((member) => member.roles.includes(role.id));
      if (alreadyAssignedMembers.length < minAssignees) unassigned.push({
        project: withSkills.unassigned.project,
        alreadyAssignedMembers,
        rejectedInvites: await withSkills.unassigned.getAllRejectedInvites(),
        skills: withSkills.skills,
        projectSkillId: withSkills.projectSkillId
      });
    }
    return unassigned;
  }

  async getProjRequestComponent(pbProj) {
    const projectSkills = await this.pb
      .collection("ext_alloc_project_skills")
      .getFirstListItem('project="' + pbProj.id + '"', { expand: "skills" });
    const allSkills = await this.getAllSkills();
    return (
      <ProjectRequestCard
        projectSkillId={projectSkills.id}
        currentSkills={projectSkills.skills?.map((skillId) =>
          allSkills.find((skill) => skill.id === skillId),
        )}
        allSkills={
          allSkills?.map((skill) => ({ id: skill.id, title: skill.title })) ||
          []
        }
        orgId={this.pbOrg.id}
        prjId={pbProj.id}
        prjName={pbProj.project.name}
        prjDesc={pbProj.project.description}
      />
    );
  }

  // -- Allocation --

  projectsWithScores(
    unassignedProjectsWithSkills, membersWithSkills, matchMembersWithNoCommonSkills
  ) {
    const memberSkills = membersWithSkills.map((member) => {
      return member.request.expand.skills.map((skill) => skill.id);
    });
    const scoreMatrix = [];
    const projects = unassignedProjectsWithSkills.map((project) => {
      const projectSkills = project.skills.map((skill) => skill.id);
      const scores = memberSkills.map(
        (skills, index) => {
          if (projectSkills.length == 0) return 0;
          const member = membersWithSkills[index];

          const isRejected = project.rejectedInvites
            .some((invite) => invite.org_member === member.request.org_member);
          if (isRejected) return -1;

          const alreadyAssigned = project.alreadyAssignedMembers
            .some((assigned) => {
              console.log(assigned.org_member, member.request.org_member);
              return assigned.org_member === member.request.org_member
            });
          if (alreadyAssigned) return -1;

          const score = projectSkills.filter((skill) => skills.includes(skill)).length
          return Math.round(score * 100.0 / projectSkills.length);
        }
      );
      scoreMatrix.push(scores);
      return { ...project, scores };
    });
    const toRemove = [];
    const members = membersWithSkills.map((member, index) => {
      const scores = scoreMatrix.map((score) => score[index]);
      if (!matchMembersWithNoCommonSkills && Math.max(...scores) === 0) {
        toRemove.push(index);
      }
      return { ...member, scores }
    });
    if (toRemove.length > 0) {
      toRemove.reverse().forEach((i) => {
        members.splice(i, 1);
      });
      projects.forEach((project) => {
        project.scores = project.scores.filter((_, index) => !toRemove.includes(index));
      });
    }

    return { projects, members };
  }

  async allocate(projectIds, requestIds) {
    const settings = await this.getSettings();
    const minAssignees = settings.min_members || 2;
    const matchMembersWithNoCommonSkills = settings.match_members_with_no_common_skills || false;
    const projectsWithSkills = (await this.getAllUnassignedProjects()).filter(
      (unassigned) => projectIds.includes(unassigned.project.id)
    );
    const membersWithSkills = (await this.getAllRequestsWithProjects()).filter(
      (member) => requestIds.includes(member.request.id)
    );

    if (projectsWithSkills.length === 0 || membersWithSkills.length === 0) {
      return [];
    }

    const sortedProjects = projectsWithSkills.sort((a, b) => {
      const requiredA = minAssignees - a.alreadyAssignedMembers.length;
      const requiredB = minAssignees - b.alreadyAssignedMembers.length;
      return (requiredA * a.skills.length) - (requiredB * b.skills.length);
    }).reverse();

    // console.log("Projects", sortedProjects.map((unassigned) => unassigned.project.name));

    const assignments = [];
    const { projects, members } = this.projectsWithScores(sortedProjects, membersWithSkills, matchMembersWithNoCommonSkills);


    // console.log("Members", members.length);
    // console.log("Project Scores", projects.map((unassigned) => unassigned.scores));

    // var round = 0;
    while (true) {
      // console.log("\n\n-----Round------", round++);

      var wasAbleToAssign = false;
      projects.forEach((unassigned, index) => {
        // check if all members are assigned
        if (unassigned.alreadyAssignedMembers.length >= minAssignees) {
          // console.log(unassigned.project.name, "All members are assigned");
          unassigned.scores = unassigned.scores.map((_) => -1);
          return;
        }

        if (wasAbleToAssign) return;

        const bestScore = Math.max(...unassigned.scores);
        if (bestScore < 0) return;
        // console.log("Project", unassigned.project.name, unassigned.alreadyAssignedMembers.length);
        // console.log("Scores", unassigned.scores);
        // console.log("Best Score", bestScore);

        const indexOfBest = unassigned.scores.indexOf(bestScore);
        const bestMember = members[indexOfBest];

        // console.log("Best Member", bestMember.request.expand.org_member.expand.user.name);

        // do next projects have better scores?
        // console.log("-Checking next projects- ", indexOfBest);
        for (let i = index + 1; i < projects.length; i++) {
          const project = projects[i];
          const scores = project.scores;
          if (scores[indexOfBest] > bestScore) {
            // console.log("next projects have better scores");
            unassigned.scores[indexOfBest] = -1;
            return;
          }
          // console.log("Project", project.project.name, ":", scores);
        }

        bestMember.alreadyAssignedProjects.push(unassigned.project);
        unassigned.alreadyAssignedMembers.push(bestMember.request);
        unassigned.scores[indexOfBest] = -1;

        assignments.push({
          project: unassigned.project,
          request: bestMember.request,
          score: bestScore,
          skills: unassigned.skills
        });

        // console.log("--Assigned!--");
        // console.log("Project", unassigned.project.name, unassigned.alreadyAssignedMembers.length, unassigned.scores);
        // console.log("Member", bestMember.request.expand.org_member.expand.user.name);

        // console.log("---Members Size", members.length, "---");
        // check if all members are assigned
        const toRemove = [];
        members.forEach((member, index) => {
          if (member.alreadyAssignedProjects.length >= member.request.max_projects) {
            members.splice(index, 1);
            toRemove.push(index);
          }
        });
        // console.log("Members Size After Removing", members.length);

        // console.log(members.map((member) => member.request.expand.org_member.expand.user.name));
        projects.forEach((newb, index) => {

          if (newb.alreadyAssignedMembers.length >= minAssignees) {
            newb.scores = newb.scores.map((_) => -1);
          } else {
            newb.scores[indexOfBest] = bestMember.scores[index];
          }

          // remove already assigned members
          newb.scores = newb.scores.filter((_, index) => !toRemove.includes(index));

          // console.log(newb.project.name, newb.alreadyAssignedMembers.length, newb.scores);
        });

        wasAbleToAssign = true;
      });

      // console.log("--wasAbleToAssign--", wasAbleToAssign);
      if (!wasAbleToAssign) break;
    }

    // console.log("Assignments", assignments.length);
    return assignments;
  }

  // -- Assign History --

  async assignMemberTo(projectId, orgMemberId, skillIds) {
    const [settings, project, orgMember] = await Promise.all([
      this.getSettings(),
      this.pbOrg.getProject(projectId),
      this.pbOrg.getMember(orgMemberId)
    ]);
    const roleId = (await project.getRoleForName(settings.project_role_name)).id;
    const invite = await project.addMemberOrInvite(orgMember, roleId ? [roleId] : []);

    return await this.pb.collection('ext_alloc_assign_history').create({
      ext: this.pbId,
      project: project.id,
      org_member: orgMember.id,
      roles: roleId ? [roleId] : [],
      invite: invite.id,
      matched: skillIds
    });
  }

  async getAssignHistory() {
    return await this.pb.collection('ext_alloc_assign_history').getFullList({
      filter: 'project.org.id="' + this.pbOrg.id + '"',
      expand: 'project, org_member.user, org_member.roles, invite, roles'
    });
  }
}
