import { X, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/sheet";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from 'date-fns';
import { PRJ_DASHBOARD } from "@/constants/page-routes";
import { 
  API_GET_NOTIFICATIONS,
  API_MARK_NOTIFICATION_READ,
  API_MARK_ALL_NOTIFICATIONS_READ
} from "@/constants/api-routes";

export default function NotificationsSheet({
  isOpen,
  onClose,
  orgId,
  initialNotifications,
  onNotificationsChange
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  const fetchNotifications = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch(API_GET_NOTIFICATIONS(orgId));
      const data = await response.json();
      setNotifications(data);
      onNotificationsChange(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await fetch(API_MARK_NOTIFICATION_READ, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orgId, notificationId })
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleClick = async (notification) => {
    await handleMarkRead(notification.id);

    if (notification.project_added) {
      const projectId = notification.expand.project_added.expand.project.id;
      router.push(PRJ_DASHBOARD(orgId, projectId));
      onClose();
    }

    if (notification.project_invite) {
      const projectId = notification.expand.project_invite.expand.project.id;
      router.push(PRJ_DASHBOARD(orgId, projectId));
      onClose();
    }
    // TODO: Handle other notification types
  };

  const handleProjectInvite = async (notification, inviteId, accepted) => {
    // TODO: Handle project invite accept/decline
    await handleMarkRead(notification.id);
  };

  const renderNotificationContent = (notification) => {
    if (notification.task_history) {
      const history = notification.expand.task_history;
      const task = history.expand.task;
      console.log('history', history);
      const changedBy = history.expand.changed_by?.expand?.org_member?.expand?.user?.name;

      let changeMessage;
      switch (history.change) {
        case 'STATUS':
          changeMessage = `Status changed to ${history.expand.status?.name}`;
          break;
        case 'TITLE':
          changeMessage = `Title changed to "${history.title}"`;
          break;
        case 'DESC':
          changeMessage = 'Description was updated';
          break;
        case 'PRIORITY':
          changeMessage = `Priority changed to ${history.priority}`;
          break;
        case 'DUE_DATE':
          changeMessage = `Due date changed to ${new Date(history.due_date).toLocaleDateString()}`;
          break;
        case 'ASSIGNED_TO':
          const assignees = history.expand.assigned_to?.map(a => 
            a.expand?.org_member?.expand?.user?.name
          ).join(', ');
          changeMessage = `Assignees updated to: ${assignees || 'none'}`;
          break;
        case 'REVIEWERS':
          const reviewers = history.expand.reviewers?.map(r => 
            r.expand?.org_member?.expand?.user?.name
          ).join(', ');
          changeMessage = `Reviewers updated to: ${reviewers || 'none'}`;
          break;
        default:
          changeMessage = 'Task was updated';
      }

      return (
        <div>
          <h3 className="font-semibold">Task Update: {task.title}</h3>
          <p className="text-sm text-muted-foreground">
            {changeMessage} by {changedBy}
          </p>
        </div>
      );
    }

    if (notification.project_invite) {
      const invite = notification.expand.project_invite;
      return (
        <div>
          <h3 className="font-semibold">Project Invitation</h3>
          <p className="text-sm text-muted-foreground">
            You've been invited to join {invite.expand.project.name}
          </p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => handleProjectInvite(notification, invite.id, true)}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleProjectInvite(notification, invite.id, false)}>
              Decline
            </Button>
          </div>
        </div>
      );
    }

    if (notification.project_added) {
      const added = notification.expand.project_added;
      return (
        <div>
          <h3 className="font-semibold">Added to Project</h3>
          <p className="text-sm text-muted-foreground">
            You've been added to {added.expand.project.name}
          </p>
        </div>
      );
    }

    return null;
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(API_MARK_ALL_NOTIFICATIONS_READ, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orgId })
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground">No new notifications</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={`rounded-lg bg-muted p-4 relative hover:bg-muted/80 transition-colors cursor-pointer`}
              >
                {renderNotificationContent(notification)}
                <span className="absolute top-2 right-2 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={fetchNotifications}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {notifications.length > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              Mark All as Read
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
