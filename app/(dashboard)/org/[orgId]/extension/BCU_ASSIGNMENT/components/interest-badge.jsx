"use client";
import { useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { X, Edit } from "lucide-react";

export default function InterestBadge({
  interest,
  onEdit,
  onSplit,
  disabled,
  isSelected,
  onToggleSelect,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInterest, setEditedInterest] = useState(interest);
  const [splitInterests, setSplitInterests] = useState("");

  const handleEdit = () => {
    onEdit(interest, editedInterest);
    setIsEditing(false);
  };

  const handleSplit = () => {
    const newInterests = splitInterests
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i);
    if (newInterests.length > 1) {
      onSplit(interest, newInterests);
      setSplitInterests("");
    }
  };

  const handleBadgeClick = (e) => {
    // Prevent triggering when clicking the edit button
    if (e.target.closest("button")) return;
    onToggleSelect(interest);
  };

  return (
    <Badge
      variant={isSelected ? "default" : "secondary"}
      className={`m-1 cursor-pointer border-2 ${isSelected ? "bg-primary text-primary-foreground border-blue-500" : "border-primary-foreground"}`}
      title={disabled ? "Import both data before editing" : ""}
      onClick={handleBadgeClick}
    >
      {!isEditing ? (
        <>
          {interest}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-2 hover:bg-transparent"
                disabled={disabled}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex flex-col space-y-2">
                <Input
                  value={editedInterest}
                  onChange={(e) => setEditedInterest(e.target.value)}
                  placeholder="Edit interest"
                  onClick={(e) => e.stopPropagation()}
                />
                <Button onClick={handleEdit}>Save</Button>
                <Input
                  value={splitInterests}
                  onChange={(e) => setSplitInterests(e.target.value)}
                  placeholder="Split interests (comma-separated)"
                  title="When splitting interests, make sure to match the existing case to avoid creating duplicate interests"
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  onClick={handleSplit}
                  title="When splitting interests, make sure to match the existing case to avoid creating duplicate interests"
                >
                  Split
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </>
      ) : (
        <Input
          value={editedInterest}
          onChange={(e) => setEditedInterest(e.target.value)}
          onBlur={handleEdit}
          onKeyPress={(e) => e.key === "Enter" && handleEdit()}
          className="h-6 px-1 py-0 text-xs"
        />
      )}
    </Badge>
  );
}
