import { format } from "date-fns";
import { X } from "lucide-react";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Badge } from "@/components/badge";
import { DatePickerWithRange } from "./date-range-picker";
import { PRIORITIES } from "./task-priorities.js";

const FilterBar = ({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  dateRange,
  setDateRange,
  statuses,
  hasActiveFilters,
  handleResetFilters,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[300px]"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearch("")}
                className="h-10 w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>All Priorities</SelectItem>
                {Object.entries(PRIORITIES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-sm text-muted-foreground">Active filters:</div>
            <div className="flex gap-2 flex-wrap">
              {search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {search}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearch("")}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statuses.find((s) => s.id === status)?.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setStatus(undefined)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {priority && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Priority: {PRIORITIES[priority]}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPriority(undefined)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {dateRange?.from && dateRange?.to && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date: {format(new Date(dateRange.from), "MMM dd")} -{" "}
                  {format(new Date(dateRange.to), "MMM dd")}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDateRange({ from: null, to: null })}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
