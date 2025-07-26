"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { SidebarMenuButton } from "@/components/sidebar";
import { API_LOGOUT, API_SWITCH_ACCOUNT, API_USER_AVATAR } from "@/constants/api-routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import { User, LogOut, Settings, Plus } from "lucide-react";
import { DASHBOARD, LOGIN, USER_SETTINGS } from "@/constants/page-routes";
import Link from "next/link";
import AccountSwitchModal from "./account-switch-modal";
import { useToast } from "@/hooks/use-toast";

export default function UserMenu({ user, storedAccounts }) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [showAccountSwitch, setShowAccountSwitch] = useState(false);
  const [accounts, setAccounts] = useState(storedAccounts || []);
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const response = await fetch(API_LOGOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const nextAccount = await response.json();
        if (nextAccount) {
          window.location.reload();
        } else {
          router.push(LOGIN);
        }
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddAccount = () => {
    setShowAccountSwitch(false);
    router.push(`${LOGIN}?addAccount=true`);
  };

  const handleSwitchAccount = async (account) => {
    try {
      const response = await fetch(API_SWITCH_ACCOUNT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: account.user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch account');
      }

      setShowAccountSwitch(false);
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error switching account",
        description: error.message,
        variant: "destructive",
      });
      setAccounts(accounts.filter(acc => acc.user.id !== account.user.id));
    }
  };

  return (
    <div className="relative z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar && API_USER_AVATAR(user.id)} />
              <AvatarFallback className="text-xl">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{user.name || user.email}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={USER_SETTINGS}>
              <Settings className="mr-2 h-4 w-4" />
              {t("accountSettings")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowAccountSwitch(true)}>
            <User className="mr-2 h-4 w-4" />
            {t("switchAccount")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountSwitchModal
        isOpen={showAccountSwitch}
        onClose={() => setShowAccountSwitch(false)}
        currentUser={user}
        accounts={accounts}
        onAddAccount={handleAddAccount}
        onSwitchAccount={handleSwitchAccount}
      />
    </div>
  );
}
