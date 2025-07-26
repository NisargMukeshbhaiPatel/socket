"use client";
import { useData } from "@/(dashboard)/context";
import { useState, useEffect } from "react";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/button";
import NotificationsSheet from "./notifications-sheet";

export default function Header({ orgId, settingsButton }) {
  const { getOrgData } = useData();
  const org = getOrgData(orgId);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?orgId=${orgId}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Fetch notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [orgId]);

  return (
    <>
      <header>
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold">{org.name}</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                )}
                <span className="sr-only">Open notifications</span>
              </Button>
            </div>
            {settingsButton}
          </div>
        </div>
      </header>
      <NotificationsSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        orgId={orgId}
        initialNotifications={notifications}
        onNotificationsChange={setNotifications}
      />
    </>
  );
}
