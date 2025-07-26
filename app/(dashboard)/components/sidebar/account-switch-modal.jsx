"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import { Button } from "@/components/button";
import { User, Plus, Check, Loader2 } from "lucide-react";
import { API_USER_AVATAR } from "@/constants/api-routes";

export default function AccountSwitchModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  accounts = [], 
  onAddAccount,
  onSwitchAccount 
}) {
  const t = useTranslations("Dashboard");
  const [switchingAccountId, setSwitchingAccountId] = useState(null);
  const otherAccounts = accounts.filter(acc => acc.user.id !== currentUser.id);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.pointerEvents = '';
    }
    return () => {
      document.body.style.pointerEvents = '';
    };
  }, [isOpen]);

  const handleAccountSwitch = async (account) => {
    setSwitchingAccountId(account.user.id);
    try {
      await onSwitchAccount(account);
    } finally {
      setSwitchingAccountId(null);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          document.body.style.pointerEvents = '';
        }
        onClose();
      }}
      // Add this to prevent closing while switching
      onPointerDownOutside={(e) => {
        if (switchingAccountId) {
          e.preventDefault();
        }
      }}
    >
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-base">{t("switchAccount")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-1">
          {[{ user: currentUser }, ...otherAccounts].map((account, index) => (
            <Button
              key={account.user.id || index}
              variant="ghost"
              className="w-full justify-between px-2 h-14 font-normal"
              onClick={() => handleAccountSwitch(account)}
              disabled={account.user.id === currentUser.id || switchingAccountId !== null}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={account.user.avatar && API_USER_AVATAR(account.user.id)} />
                  <AvatarFallback>
                    {account.user.name?.charAt(0) || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="truncate leading-none">
                    {account.user.name || account.user.email}
                  </span>
                  <span className="text-xs text-muted-foreground truncate leading-relaxed">
                    {account.user.email}
                  </span>
                </div>
              </div>
              {account.user.id === currentUser.id ? (
                <Check className="h-4 w-4 text-muted-foreground" />
              ) : switchingAccountId === account.user.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
            </Button>
          ))}
          <div className="pt-1">
            <div className="h-px bg-border my-1" />
            <Button
              variant="ghost"
              className="w-full justify-between px-2 h-11 font-normal text-muted-foreground hover:text-foreground"
              onClick={onAddAccount}
              disabled={switchingAccountId !== null}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <span>{t("addAccount")}</span>
              </div>
            </Button>
          </div>
        </div>
        {switchingAccountId && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-0.5 w-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary/50" 
                style={{
                  width: '30%',
                  animation: 'progress 1.5s infinite linear',
                  '@keyframes progress': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(400%)' }
                  },
                }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
