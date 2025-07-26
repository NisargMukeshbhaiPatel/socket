"use client";
import { useTranslations } from "next-intl";
import { useDBTranslation } from "@/hooks/use-db-translation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Badge } from "@/components/badge";
import { Plus } from "lucide-react";
import { Button } from "@/components/button";
import { useData } from "./context";
import { CREATE_ORG, ORG_DASHBOARD } from "@/constants/page-routes";
import { API_ORG_ICON, API_RESPOND_INVITE } from "@/constants/api-routes";

export default function Dashboard() {
  const t = useTranslations("Dashboard");
  const tDB = useDBTranslation();

  const { orgs, invites } = useData();
  const router = useRouter();
  const { toast } = useToast();

  const respondInvite = async (inviteId, accepted) => {
    try {
      const response = await fetch(API_RESPOND_INVITE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, accepted }),
      });
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res?.error);
      }
      router.refresh();
    } catch (err) {
      console.error("ERR in sending invite:", err.message);
      toast({
        title: err.message,
        variant: "destructive",
      });
    }
  };
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-4">{t("yourOrgs")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(orgs && orgs?.length) > 0 ? (
            orgs.map(({ org }) => (
              <Link key={org.id} href={ORG_DASHBOARD(org.id)}>
                <Card className="h-full hover:bg-accent cursor-pointer">
                  <CardHeader className="flex flex-row items-center gap-4 px-4">
                    <Avatar className="h-16 w-16 rounded-full">
                      <AvatarImage
                        src={org.icon && API_ORG_ICON(org.id)}
                        alt={org.name}
                      />
                      <AvatarFallback className="text-3xl">
                        {org?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="flex">{org.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{org.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Link href={CREATE_ORG}>
              <Card className="max-w-sm hover:bg-accent">
                <CardContent className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
                  <Plus className="h-24 w-24 text-accent-foreground" />
                  <h3 className="text-xl font-semibold">{t("newOrg")}</h3>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("orgInvites")}</h2>
        {invites && invites?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invites.map(({ id, org, roles }, i) => (
              <Card className="flex flex-col justify-between" key={i}>
                <CardHeader>
                  <div className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16 rounded-full">
                      <AvatarImage
                        src={API_ORG_ICON(org.id)}
                        alt={org.name}
                      />
                      <AvatarFallback className="text-3xl">
                        {org?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle>{org.name}</CardTitle>
                  </div>
                  <CardDescription>{org.description}</CardDescription>
                  <div className="pt-1 flex gap-2 flex-wrap">
                    {roles?.map((role, i) => (
                      <Badge key={i} style={{ backgroundColor: role.color }}>
                        {tDB(role.name)}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        respondInvite(id, false);
                      }}
                    >
                      {t("decline")}
                    </Button>
                    <Button
                      onClick={() => {
                        respondInvite(id, true);
                      }}
                    >
                      {t("accept")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("noInvites")}</CardTitle>
              <CardDescription>{t("noInvitesDesc")}</CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </div>
  );
}
