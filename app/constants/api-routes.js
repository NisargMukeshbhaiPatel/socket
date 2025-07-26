// Auth-related API routes
export const API_LOGIN = "/api/auth/login";
export const API_REGISTER = "/api/auth/register";
export const API_LOGOUT = "/api/auth/logout";
export const API_SWITCH_ACCOUNT = "/api/auth/switch";
export const API_RESET_PASSWORD = "/api/auth/reset-password";
export const API_CHANGE_PASSWORD = "/api/auth/change-password";

// User Profile
export const API_UPDATE_USER_PROFILE = "/api/user/profile";
export const API_USER_AVATAR = (userId) => `/api/user/avatar?id=${userId}`;

// Organization-related API routes
export const API_ORG_ICON = (orgId) => `/api/org/icon?id=${orgId}`;
export const API_CREATE_ORG = "/api/org/create/";
export const API_SEND_INVITE = "/api/org/invite/send";
export const API_RESPOND_INVITE = "/api/org/invite/respond";

// Updated Organization-related API routes
export const API_UPDATE_ORG_ICON = "/api/org/settings/update-icon";
export const API_UPDATE_ORG = "/api/org/settings/update-org";
export const API_ORG_ROLE_CREATE = "/api/org/settings/role/create";
export const API_ORG_ROLE_DELETE = "/api/org/settings/role/delete";
export const API_ORG_ROLE_EDIT = "/api/org/settings/role/edit";
export const API_ORG_EXTENSION_DELETE = "/api/org/settings/extension/delete";
export const API_ORG_EXTENSION_ADD = "/api/org/settings/extension/add";
// Org Uploads API routes
export const API_ORG_UPLOAD_MEMBERS = "/api/org/upload/members";
export const API_ORG_UPLOAD_PROJECTS = "/api/org/upload/projects";

// Org Members API routes
export const API_ORG_UPDATE_MEMBER_ROLES = "/api/org/member/update";

// Notification API routes
export const API_GET_NOTIFICATIONS = (orgId) =>
  `/api/notifications?orgId=${orgId}`;
export const API_MARK_NOTIFICATION_READ = "/api/notifications/read";
export const API_MARK_ALL_NOTIFICATIONS_READ = "/api/notifications/read-all";

// Org Extensions

// Extension: Auto Allocation
export const API_ORG_EXTENSION_AUTOALLOC_SKILLS_REQ_RESPOND =
  "/api/org/extension/AutoAllocation/skills-request/respond";
export const API_ORG_EXTENSION_AUTOALLOC_SKILLS_REQ_SEND =
  "/api/org/extension/AutoAllocation/skills-request/send";
export const API_ORG_EXTENSION_AUTOALLOC_UPDATE_SETTINGS =
  "/api/org/extension/AutoAllocation/update-settings";
export const API_ORG_EXTENSION_AUTOALLOC_ALLOCATE =
  "/api/org/extension/AutoAllocation/allocate";
export const API_ORG_EXTENSION_AUTOALLOC_ASSIGN_MEMBERS_TO_PROJECTS =
  "/api/org/extension/AutoAllocation/assign-members-to-projects";

// Auto Allocation - Project Skills
export const API_ORG_EXTENSION_AUTOALLOC_PROJECT_SKILLS_GENERATE =
  "/api/org/extension/AutoAllocation/project-skills/generate";
export const API_ORG_EXTENSION_AUTOALLOC_PROJECT_SKILLS_UPDATE =
  "/api/org/extension/AutoAllocation/project-skills/update";

export const API_ORG_EXTENSION_AUTOALLOC_GENERATE_USER_SKILLS =
  "/api/org/extension/AutoAllocation/generate-user-skills";

// Extension: BCU_ASSIGNMENT
export const API_ORG_EXTENSION_BCU_ALLOCATE =
  "/api/org/extension/BCU_ASSIGNMENT/allocate";

// Project
export const API_SEND_PRJ_INVITE = "/api/project/invite/send";
export const API_RESPOND_PRJ_INVITE = "/api/project/invite/respond";
export const API_CREATE_PRJ = "/api/project/create/";
// Project Members API routes
export const API_PRJ_UPDATE_MEMBER_ROLES = "/api/project/member/update";
// Project Settings - Role
export const API_CREATE_PRJ_ROLE = "/api/project/settings/role/create";
export const API_EDIT_PRJ_ROLE = "/api/project/settings/role/edit";
export const API_DELETE_PRJ_ROLE = "/api/project/settings/role/delete";
// Project Settings - Update Project
export const API_UPDATE_PRJ = "/api/project/settings/update-prj";
// Project Settings - Statuses
export const API_CREATE_PRJ_STATUS = "/api/project/settings/status/create";
export const API_EDIT_PRJ_STATUS = "/api/project/settings/status/edit";
export const API_DELETE_PRJ_STATUS = "/api/project/settings/status/delete";
export const API_UPDATE_DONE_STATUS =
  "/api/project/settings/status/update-done-status";
// Project Settings - Extensions
export const API_PRJ_EXTENSION_ADD = "/api/project/settings/extension/add";
export const API_PRJ_EXTENSION_DELETE =
  "/api/project/settings/extension/delete";

// Task Suggestion using OpenAI
export const API_SUGGEST_TASKS = "/api/project/task/suggest";

// Task
export const API_CREATE_TASK = "/api/project/task/create";
export const API_CREATE_BULK_TASK = "/api/project/task/bulk-create";
export const API_UPDATE_TASK = "/api/project/task/update";
export const API_DELETE_TASK = "/api/project/task/delete";
export const API_MARK_TASK_AS_DONE = "/api/project/task/mark-as-done";
