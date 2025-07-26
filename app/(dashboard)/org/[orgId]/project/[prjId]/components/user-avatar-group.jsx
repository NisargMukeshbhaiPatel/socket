import { Avatar, AvatarFallback } from "@/components/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";

const UserAvatarGroup = ({ users, label }) => (
  <div className="flex flex-col gap-1">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="flex -space-x-2">
      <TooltipProvider>
        {users.map((user, i) => (
          <Tooltip key={i}>
            <TooltipTrigger>
              <Avatar className="h-8 w-8 border-2 rounded-full border-background">
                <AvatarFallback className="text-xs bg-muted">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  </div>
);

export default UserAvatarGroup;
