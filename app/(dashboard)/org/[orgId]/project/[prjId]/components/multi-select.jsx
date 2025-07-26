"use client";
import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Badge } from "@/components/badge";

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between p-1"
        >
          <div className="flex flex-wrap gap-1 overflow-hidden">
            {selected.slice(0, 2).map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="truncate max-w-[150px]"
              >
                {options.find((option) => option.id === id)?.name}
              </Badge>
            ))}
            {selected.length > 2 && (
              <Badge variant="secondary">
                <Plus className="h-4 w-4 mr-1" />
                {selected.length - 2}
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 relative" side="top">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
          />
          <CommandList>
            <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  onSelect={() => {
                    onChange(
                      selected.includes(option.id)
                        ? selected.filter((id) => id !== option.id)
                        : [...selected, option.id],
                    );
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.id)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
