import PBUser from "@/lib/pb/user";
import AutoAllocation from "@/lib/pb/extensions/org/AUTO_ALLOCATION/AutoAllocation";

export async function POST(request) {
  try {
    const { orgId, assignments } = await request.json();

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const autoAlloc = await AutoAllocation.get(pbOrg);

    // Process all assignments
    const results = await Promise.all(
      assignments.map(({ memberId, projectId, matchedSkillIds }) =>{
        try {
          autoAlloc.assignMemberTo(projectId, memberId, matchedSkillIds)
        } catch (error) {
          console.error(`Error assigning member ${memberId} to project ${projectId}:`, error);
          return {
            memberId,
            projectId,
            error: error.message || error.toString(),
          };
        }
      }
      ),
    );

    return new Response(null, {
      status: 200,
    });
  } catch (error) {
    console.error("Error in assignment submission:", error);
    return new Response(
      JSON.stringify({
        error: error.data || error.message || error.toString(),
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
