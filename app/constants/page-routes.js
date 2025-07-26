// Auth Routes
export const LOGIN = "/login";
export const REGISTER = "/register";

// General Routes
export const DASHBOARD = "/";

// Organization Routes
export const CREATE_ORG = "/create";
export const ORG_DASHBOARD = (orgId) => `/org/${orgId}`;
export const ORG_MEMBERS = (orgId) => `/org/${orgId}/members`;
export const ORG_DATA_IMPORT = (orgId) => `/org/${orgId}/import`;
export const ORG_SETTINGS = (orgId) => `/org/${orgId}/settings`;

// Project Routes
export const CREATE_PRJ = (orgId) => `/org/${orgId}/create-project`;
export const PRJ_DASHBOARD = (orgId, prjId) =>
  ORG_DASHBOARD(orgId) + `/project/${prjId}`;
export const PRJ_MEMBERS = (orgId, prjId) =>
  ORG_DASHBOARD(orgId) + `/project/${prjId}/members`;
export const PRJ_SETTINGS = (orgId, prjId) =>
  ORG_DASHBOARD(orgId) + `/project/${prjId}/settings`;
// Project Task Routes
export const PRJ_TASK_DETAILS = (orgId, prjId) =>
  ORG_DASHBOARD(orgId) + `/project/${prjId}/task-details`;

// Org Extension Routes
export const EXTENSION = (orgId, extensionId) =>
  `/org/${orgId}/extension/${extensionId}`;
export const EXTENSION_SETTINGS = (orgId, extensionId) =>
  `/org/${orgId}/extension/${extensionId}/settings`;

// Org Extensions
// Auto Allocation
export const EXTENSION_AUTOALLOC_ASSIGNMENT_HISTORY = (orgId) =>
  EXTENSION(orgId, "AUTO_ALLOCATION") + "/assignment-history";
// BCU Assignment

// Prj Extension Routes
export const PRJ_EXTENSION = (orgId, prjId, extensionId) =>
  `/org/${orgId}/project/${prjId}/extension/${extensionId}`;
export const PRJ_EXTENSION_SETTINGS = (orgId, prjId, extensionId) =>
  `/org/${orgId}/project/${prjId}/extension/${extensionId}/settings`;

// User Routes
export const USER_SETTINGS = "/settings";
