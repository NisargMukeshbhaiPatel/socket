
import PBAuth from "./auth";
import PBOrg from "./org";
import PBUser from "./user";

/**
 * 
 * @param {PBOrg} pbOrg 
 * @param {File} file 
 */
export const orgMemberImporter = async (pbOrg, fileToUpload) => {
  const pb = pbOrg.pb;
  const myMember = await pbOrg.getMyMember();
  const history = await pb.collection("import_org_history").create({
    org: pbOrg.id,
    added_by: myMember.id,
    upload: fileToUpload
  });

  const importOrgId = history.id;
  const allRoles = await pbOrg.getAllRoles();
  const allProjects = (await pbOrg.getAllProjects());
  const file = pb.files.getUrl(history, history.upload);
  var count = 0;
  var newCsv = 'Email,Name,Roles,Projects,Project Roles,Password,Error\n';
  await streamLines(file, async (line) => {
    count++;
    const [emails, names, roles, projects, projectRoles] = lineToArr(line);
    try {
      if (!emails[0]) throw new Error('No email');
      if (!names[0]) throw new Error('No name');
      const newRoles = roles?.map((role) => {
        const r = allRoles.find((r) => r.id === role);
        if (!r) throw new Error(`Role ${role} not found`);
        return r
      }) || [];

      const newProjects = await Promise.all(projects?.map(async (project) => {
        const pbProj = allProjects.find((p) => p.id === project);
        if (!pbProj) throw new Error(`Project ${project} not found`);
        const roles = await pbProj.getAllRoles();
        return { pbProj, roles };
      }) || []);

      const newProjectRoles = projectRoles?.map((projectRole) => {
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

      const existing = await pbOrg.pbUser.getByEmail(emails[0]);
      if (existing) {
        await pbOrg.invite(emails[0], roles, projects, projectRoles);
        throw new Error('User already has an account, invited.');
      }

      const password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const user = await PBAuth.register(names[0], emails[0], password, true);

      const orgMember = await pbOrg.addMember(user, newRoles);
      await Promise.all(projectsWithRoles?.map(async (project) => {
        return await project.pbProj.addMember(orgMember.id, project.roles.map((r) => r.id));
      }));
      newCsv += `"${emails[0]}","${names[0]}","${roles?.join(',') || ""}","${projects?.join(',') || ""}","${projectRoles?.join(',') || ""}",${password}\n`;
    } catch (e) {
      console.error(e);
      newCsv += `"${emails[0] || ""}","${names[0] || ""}","${roles?.join(',') || ""}","${projects?.join(',') || ""}","${projectRoles?.join(',') || ""}",,"${e.message}"\n`;
    }
  });
  const historyFile = new File([new Blob([newCsv])], importOrgId + "_history.csv");
  return await pb.collection("import_org_history").update(importOrgId, { history: historyFile });
};

/**
 * 
 * @param {PBOrg} pbOrg
 */
export const getOrgImportHistory = async (pbOrg) => {
  return await pbOrg.pb.collection("import_org_history").getFullList({
    filter: `org="${pbOrg.id}"`,
    sort: "-created",
  });
};

/**
 * 
 * @param {PBOrg} pbOrg
 * @param {File} file
 */
export const projectImporter = async (pbOrg, fileToUpload) => {
  const pb = pbOrg.pb;
  const myMember = await pbOrg.getMyMember();
  const history = await pb.collection("import_project_history").create({
    org: pbOrg.id,
    added_by: myMember.id,
    upload: fileToUpload
  });

  const importProjectId = history.id;
  const file = pb.files.getUrl(history, history.upload);
  var count = 0;
  var newCsv = 'Name,Description,Template,ID,Error\n';
  await streamLines(file, async (line) => {
    count++;
    const [name, description, template] = lineToArr(line);
    try {
      if (!name[0]) throw new Error('No name');
      const pbProj = await pbOrg.createProject(name[0], description[0], template[0]);
      newCsv += `${name[0]},${description[0]},${template[0] || ""},${pbProj.id}\n`;
    } catch (e) {
      newCsv += `${name[0] || ""},${description[0] || ""},${template[0] || ""},,"${e.message}"\n`;
    }
  });
  const historyFile = new File([new Blob([newCsv])], importProjectId + "_history.csv");
  return await pb.collection("import_project_history").update(importProjectId, { history: historyFile });
};

/**
 * 
 * @param {PBOrg} pbOrg
 */
export const getProjectImportHistory = async (pbOrg) => {
  return await pbOrg.pb.collection("import_project_history").getFullList({
    filter: `org="${pbOrg.id}"`,
    sort: "-created",
  });
};

/**
 * 
 * @param {string} file
 * @param {(line: string) => Promise<void>} callback
 */
const streamLines = async (file, callback) => {
  const stream = (await fetch(file)).body.getReader();
  const decoder = new TextDecoder();
  let { value: chunk, done: readerDone } = await stream.read();

  let data = '';

  while (!readerDone) {
    data += decoder.decode(chunk, { stream: true });
    let lines = data.split('\n');
    data = lines.pop();
    for (const line of lines) {
      if (line.trim()) {
        await callback(line.trim());
      }
    }
    ({ value: chunk, done: readerDone } = await stream.read());
  }

  if (data.trim()) {
    await callback(data.trim());
  }
}

const regex = /(".*?"|[^,]+)/g;
/**
 * 
 * @param {string} line
 * */
const lineToArr = (line) => line.match(regex).map((v) => v.trim().replace(/"/g, '').split(',').map((v) => v.trim()));
