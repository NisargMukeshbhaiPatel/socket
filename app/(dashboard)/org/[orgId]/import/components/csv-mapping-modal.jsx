"use client";
import { useState, useEffect } from "react";
import { InfoIcon, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Button } from "@/components/button";

export default function CSVMappingDialog({
  isOpen,
  onOpenChange,
  csvData,
  headers,
  onSubmit,
  predefinedFields,
}) {
  const [mapping, setMapping] = useState({});

  function createInitialMapping(headers, predefinedFields) {
    const initialMapping = {};
    predefinedFields.forEach((field, index) => {
      const matchedHeader = headers.find((header) =>
        header.toLowerCase().includes(field.toLowerCase()),
      );

      initialMapping[field] = matchedHeader || headers[index];
    });
    return initialMapping;
  }

  function handleMapping(prevMapping, field, header) {
    const newMapping = { ...prevMapping };
    Object.keys(newMapping).forEach((key) => {
      if (newMapping[key] === header) {
        delete newMapping[key];
      }
    });
    newMapping[field] = header;

    return newMapping;
  }

  useEffect(() => {
    const initialMapping = createInitialMapping(headers, predefinedFields);
    setMapping(initialMapping);
  }, [headers]);

  const onMappingChange = (field, header) => {
    setMapping((prev) => handleMapping(prev, field, header));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Map csv file</DialogTitle>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-2">
                <h2 className="text-xl font-bold">Column Mapping</h2>
                <div className="ml-2 relative">
                  <span
                    className="cursor-help text-muted-foreground"
                    title="Map CSV columns to add members with required details (Name, Email, etc.)"
                  >
                    <InfoIcon className="h-5 w-5" />
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-4">
                {predefinedFields.map((field) => (
                  <div key={field} className="flex items-center">
                    <span>{field}</span>
                    <ArrowLeft className="w-4 h-4 text-gray-400 mx-1" />
                    <Select
                      onValueChange={(value) => onMappingChange(field, value)}
                      value={mapping[field]}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select CSV header" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {csvData.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-2">
                  Preview (First 5 Rows)
                </h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {headers.map((header, index) => (
                          <TableHead key={index}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSubmit(mapping)}>
            Add Members with Info
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
