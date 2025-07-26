import Client from "pocketbase";
import PBOrg from "./org";
import { PBTask } from "./task";

const taskExpand = 'task_history.task, task_history.changed_by.org_member.user, task_history.status, task_history.assigned_to.org_member.user, task_history.reviewers.org_member.user, task_history.created_by.org_member.user';
const projectInviteExpand = 'project_invite.project, project_invite.roles';
const projectAddedExpand = 'project_added.project, project_added.roles';
const expand = `member.user, ${taskExpand}, ${projectInviteExpand}, ${projectAddedExpand}`;

export default class PBNotification {
    constructor(pbOrg, notification) {
        /**
         * @type {PBOrg}
         * */
        this.pbOrg = pbOrg;
        /**
         * @type {Client}
         * */
        this.pb = pbOrg.pb;
        this.notification = notification;
        this.id = notification.id;
    }

    static async get(pbOrg, notificationId) {
        const pb = pbOrg.pb;
        const myMember = await pbOrg.getMyMember();
        const notification = await pb.collection('notifications').getOne(notificationId, {
            expand: expand
        });
        if (notification.member !== myMember.id) throw new Error('Notification not found');
        return new PBNotification(pbOrg, notification);
    }

    static async getMyNotifications(pbOrg) {
        const pb = pbOrg.pb;
        const member = await pbOrg.getMyMember();
        const notifications = await pb.collection('notifications').getFullList({
            filter: 'member="' + member.id + '" && read=false',
            expand: expand
        });
        return notifications.map(notification => new PBNotification(pbOrg, notification));
    }

    async markRead() {
        return await this.pb.collection('notifications').update(this.id, {
            read: true
        });
    }

    async markUnread() {
        return await this.pb.collection('notifications').update(this.id, {
            read: false
        });
    }

    async delete() {
        return await this.pb.collection('notifications').delete(this.id);
    }

    /**
     * 
     * @param {PBTask} pbTask
     */
    static async createTaskHistoryNotification(pbTask, history) {
        const pb = pbTask.pb;
        const members = await pbTask.pbProject.getAllMembers();
        members.forEach(async member => {
            await pb.collection('notifications').create({
                member: member.org_member,
                task_history: history.id,
            });
        });
    }

    static async createProjectAddedNotification(pbProject, projectMember) {
        const pb = pbProject.pb;
        const member = projectMember.org_member;
        await pb.collection('notifications').create({
            member: member,
            project_added: projectMember.id,
        });
    }

    /**
     * 
     * @param {PBProject} pbProject
     */
    static async createProjectInviteNotification(pbProject, projectInvite) {
        const pb = pbProject.pb;
        const member = projectInvite.org_member;
        await pb.collection('notifications').create({
            member: member,
            project_invite: projectInvite.id,
        });
    }

    /**
     * 
     * @param {Client} pb
     */
    static async createCustomNotification(pb, orgMemberId, data) {
        await pb.collection('notifications').create({
            member: orgMemberId,
            custom: data,
        });
    }
}
