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
    <ScrollArea className="max-h-[460px] h-full overflow-visible flex w-full">
      {templates.map((template, index) => (
        <Card
          key={template.id}
          className={`mb-4 cursor-pointer transition-all ${
            selectedTemplateId === template.id
              ? "border-blue-500 dark:border-blue-500 bg-accent"
              : ""
          }`}
          onClick={() => {
            if (selectedTemplateId === template.id) {
              onSelectTemplate(null);
            } else {
              const translatedTemplate = {
                ...template,
                projectRoles: template.projectRoles.map((role) => ({
                  ...role,
                  name: tDB(role.name),
                })),
                task_statuses: template.task_statuses.map((status) => ({
                  ...status,
                  name: tDB(status.name),
                  description: tDB(status.description),
                })),
              };
              onSelectTemplate(translatedTemplate);
            }
          }}
        >
          <CardHeader>
            <CardTitle>{tDB(template.name)}</CardTitle>
            <CardDescription>{tDB(template.description)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Roles:</h4>
                <div className="flex flex-wrap gap-2">
                  {template.projectRoles.map((role, index) => (
                    <Badge
                      key={index}
                      variant={role.isAdmin ? "default" : "secondary"}
                    >
                      {tDB(role.name)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Task Statuses:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {template.task_statuses.map((status, index) => (
                    <li key={index}>
                      <span className="font-medium">{tDB(status.name)}:</span>{" "}
                      {tDB(status.description)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </ScrollArea>
  );
}
