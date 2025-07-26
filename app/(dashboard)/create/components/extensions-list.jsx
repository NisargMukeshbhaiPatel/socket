import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { ScrollArea } from "@/components/scroll-area";
import { Badge } from "@/components/badge";
import { Trash } from "lucide-react";

export default function ExtensionsColumn({ extensions, onDeleteExtension }) {
  return extensions.length > 0 ? (
    <ScrollArea className="max-h-[250px] h-full">
      {extensions.map((extension) => (
        <Card key={extension.id} className="mb-4">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Badge className="text-md">{extension.id}</Badge>
              </CardTitle>
              <div className="flex">
                <Button
                  variant="ghost"
                  type="button"
                  size="sm"
                  onClick={() => onDeleteExtension(extension.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>{extension.config?.reason}</CardContent>
        </Card>
      ))}
    </ScrollArea>
  ) : (
    <Card>
      <CardHeader>
        <p className="text-muted-foreground">No extensions selected.</p>
      </CardHeader>
    </Card>
  );
}
