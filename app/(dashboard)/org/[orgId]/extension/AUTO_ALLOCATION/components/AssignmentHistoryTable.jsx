import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Badge } from "@/components/badge";

const getStatusDetails = (status) => {
  switch (status) {
    case "PENDING":
      return { color: "bg-yellow-400", name: "Pending" };
    case "ACCEPTED":
      return { color: "bg-green-300", name: "Accepted" };
    case "REJECTED":
      return { color: "bg-red-400", name: "Rejected" };
    default:
      return { color: "", name: "Added" }; // null or undefined status means "Added"
  }
};

export default function AssignmentHistoryTable({ assignmentHistory }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member Name</TableHead>
          <TableHead>Matched Skills</TableHead>
          <TableHead>Project Assigned</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignmentHistory.map(
          ({ id, memberName, matchedSkills, projectName, inviteStatus }) => {
            const { color, name } = getStatusDetails(inviteStatus);
            return (
              <TableRow key={id}>
                <TableCell>{memberName}</TableCell>
                <TableCell>
                  {matchedSkills?.length &&
                    matchedSkills.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="secondary"
                        className="mr-1"
                      >
                        {skill.title}
                      </Badge>
                    ))}
                </TableCell>
                <TableCell>{projectName}</TableCell>
                <TableCell>
                  <Badge className={color}>{name}</Badge>
                </TableCell>
              </TableRow>
            );
          },
        )}
      </TableBody>
    </Table>
  );
}
