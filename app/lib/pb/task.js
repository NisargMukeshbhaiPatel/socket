import { CREATE_TASKS, MANAGE_TASKS } from "../../../templates/permissions";
import PBNotification from "./notification";
import PBProject from "./project";
import Client from "pocketbase";

const expand = 'status, assigned_to.org_member.user, reviewers.org_member.user, created_by.org_member.user';
export default class PBTask {

  static async getAll(pbProject) {
    const pb = pbProject.pb;
    const member = await pbProject.getMyMember();
    const tasks = await pb.collection("tasks").getFullList({
      filter: 'project="' + pbProject.id + '"',
      expand: expand
    });
    return tasks.map(task => new PBTask(pbProject, task, member));
  }

  static async get(pbProject, taskId) {
    const pb = pbProject.pb;
    const member = await pbProject.getMyMember();
    const task = await pb.collection("tasks").getOne(taskId, { expand });
    return new PBTask(pbProject, task, member);
  }

  static async getMyTasks(pbProject) {
    const pb = pbProject.pb;
    const member = await pbProject.getMyMember();
    if (!member) return [];
    const tasks = await pb.collection("tasks").getFullList({
      filter: 'project="' + pbProject.id + '" && assigned_to?~"' + member.id + '"',
      expand: expand
    });
    return tasks.map(task => new PBTask(pbProject, task, member));
  }

  static async assignedByMe(pbProject) {
    const pb = pbProject.pb;
    const member = await pbProject.getMyMember();
    const tasks = await pb.collection("tasks").getFullList({
      filter: 'project="' + pbProject.id + '" AND created_by="' + member.id + '"',
      expand: expand
    });
    return tasks.map(task => new PBTask(pbProject, task, member));
  }

  constructor(pbProject, task, member) {
    /**
     * @type {PBProject}
     * */
    this.pbProject = pbProject;
    /**
     * @type {Client}
     * */
    this.pb = pbProject.pb;
    this.task = task;
    this.member = member;
    this.id = task.id;
  }

  static async create(pbProject, title, description, dueDate, priority, statusId) {
    const pb = pbProject.pb;
    const member = await pbProject.getMyMember();
    const hasPermission = await pbProject.iHavePermission(CREATE_TASKS);
    if (!hasPermission) throw new Error("You don't have permission to create tasks");

    const task = await pb.collection("tasks").create({
      title,
      description,
      project: pbProject.id,
      created_by: member?.id,
      due_date: dueDate,
      priority,
      status: statusId
    });
    return new PBTask(pbProject, task, member);
  }

  async delete() {
    const hasPermission = await this.pbProject.iHavePermission(MANAGE_TASKS);
    if (!hasPermission) throw new Error("You don't have permission to delete tasks");

    return await this.pb.collection('tasks').delete(this.id);
  }

  async hasEditPermission() {
    if (this.member) {
      if (this.task.created_by === this.member.id) return true;
      if (this.task.assigned_to && this.task.assigned_to.includes(this.member.id)) return true;
      if (this.task.reviewers && this.task.reviewers.includes(this.member.id)) return true;
    }
    return await this.pbProject.iHavePermission(MANAGE_TASKS);
  }

  async ensureHasEditPerms() {
    const hasPermission = await this.hasEditPermission();
    if (!hasPermission) throw Error("You don't have permission to edit this task");
  }

  async editTitle(title) {
    await this.hasEditPermission();
    const history = await this.pb.collection('task_history').create({
      task: this.id,
      change: 'TITLE',
      changed_by: this.member?.id,
      title: title,
    });
    PBNotification.createTaskHistoryNotification(this, history);
    return await this.pb.collection('tasks').update(this.id, {
      title
    });
  }

  async editDescription(description) {
    await this.hasEditPermission();
    const history = await this.pb.collection('task_history').create({
      task: this.id,
      change: 'DESC',
      changed_by: this.member?.id,
      description: description,
    });
    PBNotification.createTaskHistoryNotification(this, history);
    return await this.pb.collection('tasks').update(this.id, {
      description
    });
  }

  async editStatus(statusId) {
    await this.hasEditPermission();
    const history = await this.pb.collection('task_history').create({
      task: this.id,
      change: 'STATUS',
      changed_by: this.member?.id,
      status: statusId,
    });
    PBNotification.createTaskHistoryNotification(this, history);
    return await this.pb.collection('tasks').update(this.id, {
      status: statusId
    });
  }

  async editPriority(priority) {
    await this.hasEditPermission();
    const history = await this.pb.collection('task_history').create({
      task: this.id,
      change: 'PRIORITY',
      changed_by: this.member?.id,
      priority: priority,
    });
    PBNotification.createTaskHistoryNotification(this, history);
    return await this.pb.collection('tasks').update(this.id, {
      priority
    });
  }

  async editDueDate(dueDate) {
    await this.hasEditPermission();
    
    const history = await this.pb.collection('task_history').create({
      task: this.id,
      change: 'DUE_DATE',
      changed_by: this.member?.id,
      due_date: dueDate,
    });
    PBNotification.createTaskHistoryNotification(this, history);
    return await this.pb.collection('tasks').update(this.id, {
      due_date: dueDate
    });
  }

  async editAssignedTo(projectMemberIds, notify = true) {
    await this.hasEditPermission();
    if (notify) {
      const history = await this.pb.collection('task_history').create({
        task: this.id,
        change: 'ASSIGNED_TO',
        changed_by: this.member?.id,
        assigned_to: projectMemberIds,
      });
      PBNotification.createTaskHistoryNotification(this, history);
    }
    return await this.pb.collection('tasks').update(this.id, {
      assigned_to: projectMemberIds
    });
  }

  async editReviewers(projectMemberIds, notify = true) {
    await this.hasEditPermission();
    if (notify) {
      const history = await this.pb.collection('task_history').create({
        task: this.id,
        change: 'REVIEWERS',
        changed_by: this.member?.id,
        reviewers: projectMemberIds,
      });
      PBNotification.createTaskHistoryNotification(this, history);
    }
    return await this.pb.collection('tasks').update(this.id, {
      reviewers: projectMemberIds
    });
  }

  async getHistory() {
    return await this.pb.collection('task_history').getFullList({
      filter: 'task="' + this.id + '"',
      sort: '-created',
      expand: "changed_by.org_member.user, " + expand,
    })
  }
}
