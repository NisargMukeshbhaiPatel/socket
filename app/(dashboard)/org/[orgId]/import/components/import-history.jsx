import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";

export default function ImportHistory({ title, history }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      {history.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Upload File Name</TableHead>
              <TableHead>Updated Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.upload}</TableCell>
                <TableCell>{new Date(item.updated).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-4">
          <p className="text-xl text-accent-foreground">
            No import history available
          </p>
        </div>
      )}
    </div>
  );
}
