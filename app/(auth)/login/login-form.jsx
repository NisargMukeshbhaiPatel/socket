"use client";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import Link from "next/link";
import { API_LOGIN } from "@/constants/api-routes";
import { DASHBOARD, REGISTER } from "@/constants/page-routes";
import Logo from "@/ui/components/logo";

export default function LoginForm({ existingAccounts }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const [email, password] = e.target;

    if (!email.value || !password.value) {
      throw new Error(t("fillAllFields"));
    }

    try {
      const isAddingAccount = searchParams.get("addAccount") === "true";

      if (
        isAddingAccount &&
        existingAccounts.some((acc) => acc.user.email === email.value)
      ) {
        throw new Error(t("accountAlreadyExists"));
      }

      const form = {
        email: email.value,
        password: password.value,
      };

      const response = await fetch(API_LOGIN, {
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
      console.trace(err);
      let msg;
      switch (err.message) {
        case "Failed to authenticate.":
          msg = t("invalidCredentials");
          break;
        default:
          msg = err.message;
          break;
      }
      toast({
        title: msg,
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
        <h2 className="text-4xl font-bold mb-6 text-center">{t("login")}</h2>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full">
            {t("login")}
          </Button>
        </form>
        <p className="mt-4 text-md text-center text-muted-foreground">
          {t("dontHaveAccount")}{" "}
          <Link
            href={`${
              REGISTER + (searchParams.toString() ? `?${searchParams.toString()}` : "")
            }`}
            className="text-blue-500 hover:underline"
          >
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
