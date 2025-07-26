import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { HslColorPicker } from "react-colorful";
import { generateLightColor, parseHSL } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Checkbox } from "@/components/checkbox";

export function RoleManagementModal({
  isOpen,
  onClose,
  onSave,
  initialRole,
  allPerms,
}) {
  const t = useTranslations("CreateOrgForm");
  const tPerm = useTranslations("Permissions");
  const [roleName, setRoleName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleColor, setRoleColor] = useState({});
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    if (initialRole) {
      setRoleName(initialRole.name);
      setSelectedPerms(initialRole.perms);
      setIsAdmin(initialRole.isAdmin);
      setRoleColor(parseHSL(initialRole.color));
    } else {
      setRoleName("");
      setSelectedPerms([]);
      setIsAdmin(false);
      setRoleColor(generateLightColor()); //hsl object
    }
  }, [initialRole, isOpen]);

  const handleSave = () => {
    const { h, s, l } = roleColor;
    onSave({
      name: roleName.trim(),
      color: `hsl(${h}, ${s}%, ${l}%)`,
      perms: selectedPerms,
      isAdmin: isAdmin,
    });
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setIsColorPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const togglePermission = (permission) => {
    setSelectedPerms((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission],
    );
  };

  const handleAdminChange = (checked) => {
    setIsAdmin(checked);
    setSelectedPerms(checked ? [] : selectedPerms);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogDescription className="sr-only">
        {t("dialogDescription")}
      </DialogDescription>
      <DialogContent className="mx-2">
        <DialogHeader>
          <DialogTitle>
            {initialRole ? t("editRole") : t("addNewRole")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="roleName" className="shrink-0">
              {t("roleName")}
            </Label>
            <div className="flex items-center gap-2 flex-1">
              <Input
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="flex-1"
              />
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full cursor-pointer border border-gray-300"
                  style={{
                    backgroundColor: `hsl(${roleColor.h}, ${roleColor.s}%, ${roleColor.l}%)`,
                  }}
                  onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                />
                {isColorPickerOpen && (
                  <div
                    ref={colorPickerRef}
                    className="absolute z-10 right-0 mt-2"
                  >
                    <HslColorPicker color={roleColor} onChange={setRoleColor} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="admin"
              checked={isAdmin}
              onCheckedChange={handleAdminChange}
            />
            <Label htmlFor="admin" className="text-sm font-medium">
              {t("admin")}
            </Label>
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium">{t("permission")}</Label>
            {allPerms.map((permission) => (
              <div key={permission} className="flex items-center space-x-2">
                <Checkbox
                  id={permission}
                  checked={isAdmin || selectedPerms.includes(permission)}
                  onCheckedChange={() => togglePermission(permission)}
                  disabled={isAdmin}
                />
                <Label htmlFor={permission} className="text-sm font-medium">
                  {tPerm(permission)}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>
            {t("save")}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
