"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Textarea } from "@/components/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import { Upload, Plus, User } from "lucide-react";
import TemplateSelector from "./template-selector.jsx";
import { convertToBase64 } from "@/lib/utils.js";
import { ORG_MEMBERS } from "@/constants/page-routes";
import { API_CREATE_ORG } from "@/constants/api-routes";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function OrganizationCreator({
  availableExtensions,
  templates,
}) {
  const t = useTranslations("CreateOrgForm");
  const tDB = useDBTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [icon_file, setIconImage] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [roles, setRoles] = useState([]);
  const [extensions, setExtensions] = useState([]);

  const handleIconChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: t("invalidImage"),
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: t("fileSizeExceeded"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIconImage(file);
      const base64Result = await convertToBase64(file);
      setIconPreview(base64Result);
    } catch (error) {
      toast({
        title: t("imageProcessingError"),
        variant: "destructive",
      });
      console.error("Error converting image to base64:", error);
    }
  };

  function addObjectToFormData(obj) {
    const formData = new FormData();
    for (const key in obj) {
      if (
        obj.hasOwnProperty(key) &&
        obj[key] !== null &&
        obj[key] !== undefined
      ) {
        formData.append(key, obj[key]);
      }
    }
    return formData;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!orgName || orgName.trim().length < 4) {
        throw new Error(t("orgNameError"));
      }

      const formData = addObjectToFormData({
        name: orgName.trim(),
        description: orgDescription.trim(),
        icon_file: icon_file,
        org_template: selectedTemplate?.id,
        roles: JSON.stringify(roles),
        extensions: JSON.stringify(extensions),
      });

      const response = await fetch(API_CREATE_ORG, {
        method: "POST",
        body: formData,
      });

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.error);
      }

      router.push(ORG_MEMBERS(res.orgId));
      router.refresh();
    } catch (err) {
      console.error("ERR in Creating Org", err);
      toast({
        title: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="pt-0 pl-0">
        <CardTitle className="text-2xl">{t("createNewOrg")}</CardTitle>
        <CardDescription>{t("setupOrgProfile")}</CardDescription>
      </CardHeader>
      <form className="space-y-8 pb-10 sm:pb-0" onSubmit={handleSubmit}>
        <CardContent className="pl-0">
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">{t("orgName")}</Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgDescription">{t("orgDescription")}</Label>
                  <Textarea
                    id="orgDescription"
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    className="w-full resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32 rounded-full border">
                    <AvatarImage
                      src={iconPreview || undefined}
                      alt={t("orgIconAlt")}
                    />
                    <AvatarFallback className="text-4xl bg-primary/5">
                      {orgName.trim() ? (
                        orgName.charAt(0).toUpperCase()
                      ) : (
                        <User className="w-12 h-12 text-primary/40" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    id="icon_file"
                    type="file"
                    accept={ALLOWED_FILE_TYPES.join(",")}
                    onChange={handleIconChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    htmlFor="icon_file"
                    asChild
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t("changeIcon")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <TemplateSelector
          selectedTemplate={selectedTemplate}
          handleSelectedTemplate={(template) => {
            setSelectedTemplate(template);
            if (!template) return;
            setRoles(template.orgRoles);
            setExtensions(template.extensions);
          }}
          templates={templates}
          roles={roles}
          setRoles={setRoles}
          extensions={extensions}
          availableExtensions={availableExtensions}
          setExtensions={setExtensions}
          canManageRoles={true}
        />
        <Button
          className="w-full relative z-100"
          type="submit"
          disabled={isLoading}
        >
          <Plus className="w-6 h-6 -ml-1" />
          {isLoading ? t("createOrg") + "..." : t("createOrg")}
        </Button>
      </form>
    </>
  );
}
