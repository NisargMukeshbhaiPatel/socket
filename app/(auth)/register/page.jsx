"use client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import Link from "next/link";
import { LOGIN, DASHBOARD } from "@/constants/page-routes";
import { API_REGISTER } from "@/constants/api-routes";
import Logo from "@/ui/components/logo";

export default function RegisterForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const [name, email, password, confirmPassword] = e.target;

    try {
      if (
        !name.value ||
        !email.value ||
        !password.value ||
        !confirmPassword.value
      ) {
        throw new Error(t("fillAllFields"));
      }

      if (password.value !== confirmPassword.value) {
        throw new Error(t("passwordMismatch"));
      }
      const form = {
        name: name.value,
        email: email.value,
        password: password.value,
      };

      const response = await fetch(API_REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error);
      }

      const redirectUrl = searchParams.get("redirect") || DASHBOARD;
      router.push(redirectUrl);
    } catch (err) {
      console.error("ERR in registration", err.message);
      toast({
        title: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo width={240} />
        </div>
        <h2 className="text-4xl font-bold mb-6 text-center">{t("signup")}</h2>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Input id="name" type="text" placeholder={t("namePlaceholder")} />
          </div>
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t("confirmPasswordPlaceholder")}
              autoComplete="off"
            />
          </div>
          <Button type="submit" className="w-full">
            {t("signup")}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="mt-4 text-md text-center text-muted-foreground">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href={`${LOGIN}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
              className="text-blue-500 hover:underline"
            >
              {t("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
