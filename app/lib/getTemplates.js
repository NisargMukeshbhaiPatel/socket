const orgContext = require.context(
  "../../templates/organization/",
  false,
  /\.json$/,
);

export const orgTemplates = orgContext.keys().map((key) => orgContext(key));

const projectContext = require.context(
  "../../templates/project/",
  false,
  /\.json$/,
);

export const projectTemplates = projectContext.keys().map((key) => projectContext(key));