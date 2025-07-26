import { Badge } from "@/components/badge";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/card";
import { Separator } from "@/components/separator";
import { ScrollArea } from "@/components/scroll-area";
import { useTranslations } from "next-intl";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { ZapIcon } from "lucide-react";

export default function TemplateList({
  templates,
  onSelectTemplate,
  selectedTemplateId,
}) {
  const t = useTranslations("CreateOrgForm");
  const tDB = useDBTranslation();
  return (
    <ScrollArea className="max-h-[614px] h-full overflow-visible flex w-full">
      {templates.map((template, index) => (
        <Card
          key={index}
          className={`mb-4 cursor-pointer transition-all ${
            selectedTemplateId === template.id
              ? "border-blue-500 dark:border-blue-500 bg-accent"
              : ""
          }`}
          onClick={() => {
            if (selectedTemplateId === template.id) {
              onSelectTemplate(null);
            } else {
              onSelectTemplate(template);
            }
          }}
        >
          <CardHeader>
            <CardTitle className="text-lg">{tDB(template.name)}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-2">
              {tDB(template.description)}
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              {template.orgRoles.map((role, i) => (
                <Badge key={i} style={{ backgroundColor: role.color }}>
                  {tDB(role.name)}
                </Badge>
              ))}
            </div>
            {template.extensions && template.extensions.length > 0 && (
              <div className="mt-4">
                <Separator className="my-2" />
                <h2 className="text-lg font-semibold mb-2 flex items-center">
                  <ZapIcon className="w-4 h-4 mr-2 text-yellow-500" />
                  Extensions
                </h2>
                <div className="space-y-2">
                  {template.extensions.map((extension, i) => (
                    <Card key={i} className="p-2 bg-muted">
                      <h5 className="font-semibold text-sm">{extension.id}</h5>
                      <p className="text-sm text-muted-foreground">
                        {tDB(extension.config.reason)}
                      </p>
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge className="text-xs">
                            {tDB(extension.config.orgRole)}
                          </Badge>
                          <Badge className="text-xs">
                            {tDB(extension.config.projectRole)}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </ScrollArea>
  );
}
