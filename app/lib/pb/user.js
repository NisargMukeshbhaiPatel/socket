import { cookies } from "next/headers";
import PBAuth from "./auth";
import { createPB, pbUserCache } from "./global";
import PBOrg from "./org";
import Client from "pocketbase";

export default class PBUser {

  /**
   * @returns {Promise<PBUser>}
   */
  static async get() {
    const cookieStore = await cookies();
    const cookie = PBAuth.getPBCookie(cookieStore);

    let user = pbUserCache.get(cookie);
    if (user) return user;

    user = new PBUser();
    const isAuth = PBAuth.isAuthenticated(cookieStore, user.pb);
    if (!isAuth) throw new Error("Not authenticated");

    pbUserCache.set(cookie, user);
    return user;
  }

  async getByEmail(email) {
    return await this.pb.collection("users").getFirstListItem('email="' + email + '"');
  }

  constructor() {
    /**
     * @type {Client}
     */
    this.pb = createPB();
  }

  getUser() {
    return this.pb.authStore.model;
  }

  async getCurrentOrgs() {
    return await PBOrg.getAllOrgs(this);
  }

  async getOrg(id) {
    return await PBOrg.get(this, id);
  }

  async getInvites() {
    return this.pb.collection("org_invites").getFullList({
      sort: '-created',
      expand: 'org, roles',
      filter: 'email="' + this.pb.authStore.model.email + '" && status="PENDING"',
    });
  }

  async acceptInvite(inviteId, accepted) {
    const invite = await this.pb.collection("org_invites").getOne(inviteId, {
      expand: 'org, roles',
    });

    if (invite.accepted)
      throw new Error("Invite already accepted");

    if (invite.email !== this.pb.authStore.model.email)
      throw new Error("Invite not for current user");

    if (accepted) {
      const pbOrg = new PBOrg(this, invite.expand.org)
      const allRoles = await pbOrg.getAllRoles();
      const newRoles = invite.roles?.map((role) => {
        const r = allRoles.find((r) => r.id === role);
        if (!r) throw new Error(`Role ${role} not found`);
        return r
      }) || [];

      const newProjects = await Promise.all(invite.project?.map(async (project) => {
        const pbProj = pbOrg.getProject(project);
        if (!pbProj) throw new Error(`Project ${project} not found`);
        const roles = await pbProj.getAllRoles();
        return { pbProj, roles };
      }) || []);

      const newProjectRoles = invite.project_roles?.map((projectRole) => {
        const r = newProjects.find((p) =>
          p.roles.find((r) => r.id === projectRole)
        );
        if (!r) throw new Error(`Project Role ${projectRole} not found`);
        const pbProj = r.pbProj;
        const role = r.roles.find((r) => r.id === projectRole);
        return { pbProj, role };
      });

      const projectsWithRoles = newProjects.map((project) => {
        const roles = newProjectRoles?.filter((r) => r.pbProj.id === project.pbProj.id).map((r) => r.role) || [];
        return { pbProj: project.pbProj, roles };
      });

      const member = await pbOrg.addMember(this.pb.authStore.model, newRoles);
      await Promise.all(projectsWithRoles.map(async (project) => {
        return await project.pbProj.addMember(member.id, project.roles.map((r) => r.id));
      }));
    }
    return await this.pb.collection("org_invites").update(inviteId, {
      status: accepted ? "ACCEPTED" : "REJECTED",
    });
  }

  async update(avatar, name) {
    return await this.pb.collection("users").update(this.pb.authStore.model.id, { name, avatar });
  }

  async sendPasswordResetEmail() {
    return await this.pb.collection("users").requestPasswordReset(this.pb.authStore.model.email);
  }

  /**
   * @param {Client} pb
   * */
  static async changePassword(pb, token, newPassword) {
    return await pb.collection("users").confirmPasswordReset(token, newPassword, newPassword);
  }
}
