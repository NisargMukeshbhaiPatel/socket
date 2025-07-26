import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";

export default function DataTable({ title, data, renderRow, columns }) {
  if (data.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground">
          No data imported. Please select a file and import it first.
        </p>
      </div>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="flex max-h-[50vh] flex-col gap-2">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="flex-grow overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{data.map(renderRow)}</TableBody>
        </Table>
      </div>
    </div>
  );
}
