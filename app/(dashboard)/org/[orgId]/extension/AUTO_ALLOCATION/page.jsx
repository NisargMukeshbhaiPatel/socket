import Link from "next/link";
import { redirect } from "next/navigation";
import PBUser from "@/lib/pb/user";
import AutoAllocation from "@/lib/pb/extensions/org/AUTO_ALLOCATION/AutoAllocation";

import { Settings } from "lucide-react";
import AssignForm from "./components/AssignForm";
import { Button } from "@/components/button";
import {
  EXTENSION_AUTOALLOC_ASSIGNMENT_HISTORY,
  EXTENSION_SETTINGS,
  ORG_DASHBOARD,
} from "@/constants/page-routes";
import { ArrowLeft } from "lucide-react";

export default async function AutoAllocationExtPage({ params }) {
  const orgId = (await params).orgId;
  const pbUser = await PBUser.get();
  const pbOrg = await pbUser.getOrg(orgId);
  const autoAlloc = await AutoAllocation.get(pbOrg);

  const settings = await autoAlloc.getSettings();
  if (!settings.assign_role) {
    redirect(EXTENSION_SETTINGS(orgId, "AUTO_ALLOCATION"));
  }

  const allRequests = await autoAlloc.getAllRequests();
  const unassignedMembers = await autoAlloc.getAllRequestsWithProjects();

  const assignmentHistory = await autoAlloc.getAssignHistory();
  const unassignedProjects = await autoAlloc.getAllUnassignedProjects();
  const allSkills = (await autoAlloc.getAllSkills()) || [];

  return (
    <div className="container mx-auto px-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 mr-auto">
          <Link href={ORG_DASHBOARD(orgId)}>
            <ArrowLeft className="h-8 w-8 -ml-10 cursor-pointer" />
          </Link>
          <h1 className="text-3xl font-bold">Socket Auto Allocation</h1>
        </div>
        <Link
          href={EXTENSION_AUTOALLOC_ASSIGNMENT_HISTORY(orgId)}
          className="mr-2"
        >
          <Button variant="outline">Assignment History</Button>
        </Link>
        <Link href={EXTENSION_SETTINGS(orgId, "AUTO_ALLOCATION")}>
          <Button variant="ghost" size="icon">
            <Settings className="h-8 w-8" />
            <span className="sr-only">Settings</span>
          </Button>
        </Link>
      </div>
      <AssignForm
        role={settings.project_role_name}
        pendingMembers={allRequests.map((memberData) => {
          const { user, roles } = memberData.member.expand;
          return {
            id: memberData.member.id,
            name: user.name,
            roles: roles?.map((role) => ({
              name: role.name,
              color: role.color,
            })),
            found: !!memberData.found, //if the request is send and but skills data is not there
            requestId: memberData.found?.id,
            skills: memberData.found?.expand?.skills?.map((skill) => ({
              title: skill.title,
              id: skill.id,
            })) || [],
            maxProjects: memberData.found?.max_projects,
            data: memberData.found?.data,
          };
        })}
        unassignedMembers={unassignedMembers.map(({ request }) => ({
          id: request.id,
          name: request.expand.org_member.expand.user.name,
          data: request.data,
          skills: request.expand.skills.map((skill) => ({
            title: skill.title,
            id: skill.id,
          })),
          roles: request.expand.org_member.expand.roles?.map((role) => ({
            name: role.name,
            color: role.color,
          })),
          maxProjects: request.max_projects,
        }))}
        assignmentHistory={assignmentHistory.map(
          ({ id, matched, expand: { org_member, project, invite } }) => ({
            id,
            memberName: org_member.expand.user.name,
            matchedSkills: matched?.map((skillId) =>
              allSkills.find((s) => s.id === skillId),
            ),
            projectName: project.name,
            inviteStatus: invite ? invite.status : null,
          }),
        )}
        unassignedProjects={unassignedProjects.map(
          ({
            project,
            skills,
            alreadyAssignedMembers,
            rejectedInvites,
            projectSkillId,
          }) => ({
            name: project.name,
            description: project.description,
            id: project.id,
            projectSkillId: projectSkillId,
            skills: skills.map((skill) => ({
              title: skill.title,
              id: skill.id,
            })),
            assignedMembers:
              alreadyAssignedMembers?.map(
                (member) => member.expand.org_member.expand.user.name,
              ) || [],
            rejectedMembers:
              rejectedInvites?.map(
                (member) => member.expand.org_member.expand.user.name,
              ) || [],
          }),
        )}
        allSkills={allSkills.map((skill) => ({
          title: skill.title,
          id: skill.id,
        }))}
        orgId={orgId}
      />
    </div>
  );
}
