import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/input";
import { Badge } from "@/components/badge";

export default function EmailTagInput({ value, onChange }) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmails();
    }
  };

  const addEmails = () => {
    const newEmails = inputValue
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e && isValidEmail(e) && !value.includes(e));

    if (newEmails.length > 0) {
      onChange([...value, ...newEmails]);
      setInputValue("");
    }
  };

  const removeEmail = (email) => {
    onChange(value.filter((e) => e !== email));
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md">
      {value.map((email) => (
        <Badge
          key={email}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {email}
          <X
            size={14}
            className="cursor-pointer"
            onClick={() => removeEmail(email)}
          />
        </Badge>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onBlur={addEmails}
        placeholder="Enter email addresses (comma-separated)"
        className="flex-grow"
      />
    </div>
  );
}
