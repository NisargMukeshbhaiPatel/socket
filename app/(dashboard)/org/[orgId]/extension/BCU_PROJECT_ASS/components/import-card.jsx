import { useState } from "react";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Loader2 } from "lucide-react";

export default function ImportCard({ title, handleFileChange, isLoading }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Input
          id={`${title.toLowerCase()}-file`}
          type="file"
          accept=".csv, .xls, .xlsx"
          onChange={handleFileChange}
        />
        <Button
          asChild
          htmlFor={`${title.toLowerCase()}-file`}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="animate-spin shrink-0" size={20} />}
          Import
        </Button>
      </CardHeader>
      <div className="space-y-4"></div>
    </Card>
  );
}
