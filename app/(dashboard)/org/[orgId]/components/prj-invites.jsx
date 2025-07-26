"use client";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { API_RESPOND_PRJ_INVITE } from "@/constants/api-routes";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Badge } from "@/components/badge";

export default function PrjInvites({ invites, orgId }) {
  const tDB = useDBTranslation();
  const t = useTranslations("Dashboard");
  const { toast } = useToast();
  const router = useRouter();

  const respondInvite = async (inviteId, accepted) => {
    try {
      const response = await fetch(API_RESPOND_PRJ_INVITE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          inviteId,
          accepted,
        }),
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
  return invites.map(({ id, title, description, roles }) => (
    <Card className="flex flex-col justify-between" key={id}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
  ));
}
