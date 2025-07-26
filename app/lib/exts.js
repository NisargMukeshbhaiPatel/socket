export const getAllOrgExtensions = async (pb) => {
  const exts = await pb.collection("actual_org_extensions").getFullList({
    filter: "enabled=true",
  });
  const bruhExts = await Promise.all(
    exts.map(async (ext) => {
      const extModule = await import(`@/lib/pb/extensions/org/${ext.id}/${ext.class}`);
      const ExtClass = extModule.default;
      const perms = ExtClass.requiredPerms() || [];
      return {
        ext,
        perms,
      };
    })
  );
  return bruhExts;
};

export const getOrgExt = async function (org, actualExt) {
  const extModule = await import(`@/lib/pb/extensions/org/${actualExt.id}/${actualExt.class}`);
  const ExtClass = extModule.default;
  return await ExtClass.getExt(actualExt, org);
}

export const getOrgExtPerms = async function (pb, id) {
  const actualExt = await pb.collection("actual_org_extensions").getOne(id);
  const extModule = await import(`@/lib/pb/extensions/org/${actualExt.id}/${actualExt.class}`);
  const ExtClass = extModule.default;
  if (!ExtClass.requiredPerms) return [];
  return ExtClass.requiredPerms();
}

export const createOrgExtFromConfig = async function (org, actualExt, pbId, config) {
  const extModule = await import(`@/lib/pb/extensions/org/${actualExt.id}/${actualExt.class}`);
  const ExtClass = extModule.default;
  return await ExtClass.create(actualExt, org, pbId, config);
}

export const getOrgExtRequestComponents = async function (org, actualExt) {
  const ext = await getOrgExt(org, actualExt);
  if (!ext.getMyRequestComponent) return [];
  const skillReqComp = await ext.getMyRequestComponent();
  return [skillReqComp].filter(Boolean);
}

export const getOrgExtProjRequestComponents = async function (org, actualExt, pbProj) {
  const ext = await getOrgExt(org, actualExt);
  if (!ext.getMyProjectRequestComponent) return [];
  const projReqComp = await ext.getMyProjectRequestComponent(pbProj);
  return [projReqComp].filter(Boolean);
}

export const getAllPrjExtensions = async (pb) => {
  return await pb.collection("actual_prj_extensions").getFullList({
    filter: "enabled=true",
  });
};

export const getPrjExtPerms = async function (pb, id) {
  const actualExt = await pb.collection("actual_prj_extensions").getOne(id);
  const extModule = await import(`@/lib/pb/extensions/project/${actualExt.id}/${actualExt.class}`);
  const ExtClass = extModule.default;
  if (!ExtClass.requiredPerms) return [];
  return ExtClass.requiredPerms();
}

export const getPrjExt = async function (pbProj, actualExt) {
  const extModule = await import(`@/lib/pb/extensions/project/${actualExt.id}/${actualExt.class}`);
  const ExtClass = extModule.default;
  return await ExtClass.getExt(actualExt, pbProj);
};

export const createPrjExtFromConfig = async function (pbProj, actualExt, pbId, config) {
  const extModule = await import(`@/lib/pb/extensions/project/${actualExt.id}/${actualExt.class}`);
  const ExtClass = extModule.default;
  return await ExtClass.create(actualExt, pbProj, pbId, config);
}

export const getPrjExtRequestComponents = async function (extObj) {
  if (!extObj.getMyRequestComponent) return [];
  const skillReqComp = await extObj.getMyRequestComponent();
  return [skillReqComp].filter(Boolean);
}
