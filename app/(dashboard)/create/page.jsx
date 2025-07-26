import PBUser from "@/lib/pb/user";
import { getAllOrgExtensions } from "@/lib/exts.js";
import { orgTemplates } from "@/lib/getTemplates";
import OrganzationCreator from "./components/organization-creator";

export default async function TemplatesServer({ params }) {
  const orgId = (await params).orgId;
  const pbUser = await PBUser.get();
  const availableExtensions = await getAllOrgExtensions(pbUser.pb);

  return (
    <OrganzationCreator
      availableExtensions={availableExtensions.map((obj) => ({ ...obj.ext }))}
      templates={orgTemplates}
    />
  );
}
