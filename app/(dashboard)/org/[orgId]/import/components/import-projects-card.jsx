"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { FileText, Loader2, FolderKanban } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { API_ORG_UPLOAD_PROJECTS } from "@/constants/api-routes";
import { handleFileParsing, handleFileUpload } from "@/lib/utils";
import CSVMappingModal from "./csv-mapping-modal";

export default function ImportProjectsCard({ orgId }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setHeaders([]);
    setCsvData([]);

    try {
      handleFileParsing(file, (headers, data) => {
        setFile(file);
        setHeaders(headers);
        setCsvData(data.slice(1, 5));
        setIsModalOpen(true);
      });
    } catch (e) {
      toast({ title: e.message, variant: "destructive" });
    }
  };

  const handleMappingComplete = async (mapping) => {
    setIsModalOpen(false);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orgId", orgId);
      formData.append("mapping", JSON.stringify(mapping));

      await handleFileUpload(formData, API_ORG_UPLOAD_PROJECTS);
      toast({ title: "Projects created successfully" });
      router.refresh();
    } catch (err) {
      console.error("Error uploading projects:", err);
      toast({
        title: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: "max(45%, 200px)" }}>
      <Card>
        <CardHeader className="text-lg pb-2">
          <div className="flex gap-2 items-center">
            <FolderKanban />
            Import Projects
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 justify-between">
            <div className="space-y-2">
              <Input
                id="projects-csv-file"
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>
            {file && (
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                title={file.name}
                className="w-full justify-start overflow-hidden"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin shrink-0" size={20} />
                ) : (
                  <FileText className="shrink-0" size={20} />
                )}
                {file.name}
              </Button>
            )}

            <Button asChild htmlFor="projects-csv-file" className="w-full">
              <FileText />
              Select File
            </Button>
          </div>
        </CardContent>
      </Card>

      <CSVMappingModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        csvData={csvData}
        headers={headers}
        onSubmit={handleMappingComplete}
        predefinedFields={["Name", "Description", "Template"]}
      />
    </div>
  );
}
