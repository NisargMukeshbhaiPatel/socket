"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useData } from "../context";
import { useRouter } from "next/navigation";
import { DASHBOARD } from "@/constants/page-routes";
import Link from "next/link";
import { ArrowLeft, User, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { CardHeader, CardTitle, CardContent } from "@/components/card";
import { toast } from "@/hooks/use-toast";
import { API_USER_AVATAR } from "@/constants/api-routes";
import { API_RESET_PASSWORD } from "@/constants/api-routes";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AccountSettings() {
  const t = useTranslations("Account");
  const router = useRouter();
  const { user, setUser } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({ title: t("invalidImage"), variant: "destructive" });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({ title: t("fileSizeExceeded"), variant: "destructive" });
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", e.target.name.value);
      if (avatarPreview) {
        const response = await fetch(avatarPreview);
        const blob = await response.blob();
        formData.append("avatar", blob, "avatar.png");
      }

      const response = await fetch("/api/user/profile", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
      const updatedUser = await response.json();
      setUser(updatedUser);

      toast({ title: t("settingsUpdated") });
    } catch (error) {
      toast({ title: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_RESET_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({ title: "Password reset email sent to your inbox" });
    } catch (error) {
      toast({ title: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="px-0 pt-0 mb-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={DASHBOARD}>
            <ArrowLeft className="h-8 w-8" />
          </Link>
          <CardTitle className="text-2xl">{t("accountSettings")}</CardTitle>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="pl-0">
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32 rounded-full border">
                    <AvatarImage
                      src={avatarPreview || API_USER_AVATAR(user.id)}
                      alt={t("userAvatar")}
                    />
                    <AvatarFallback className="text-4xl bg-primary/5">
                      {user.name?.charAt(0) || <User className="w-12 h-12 text-primary/40" />}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    id="avatar"
                    type="file"
                    accept={ALLOWED_FILE_TYPES.join(",")}
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={() => document.getElementById("avatar").click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t("changeAvatar")}
                  </Button>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <Button
          className="w-full mt-8"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("updating")}
            </>
          ) : (
            t("saveChanges")
          )}
        </Button>
      </form>

      <div className="mt-8">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending Reset Email...
            </>
          ) : (
            "Send Password Reset Email"
          )}
        </Button>
      </div>
    </>
  );
}
