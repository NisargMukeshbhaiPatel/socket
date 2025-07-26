"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

import { handleFileParsing } from "@/lib/utils";
import { transformStudentData, transformStaffData } from "./utils";
import { ORG_DASHBOARD } from "@/constants/page-routes";

import Link from "next/link";
import { Input } from "@/components/input";
import { TableCell, TableRow } from "@/components/table";
import { ArrowLeft, CircleAlert, Search, X, History } from "lucide-react";
import { Button } from "@/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import ImportCard from "./components/import-card";
import DataTable from "./components/data-table";
import InterestBadge from "./components/interest-badge";
import AssignmentModal from "./components/assignment-modal";
import SavedAssignmentsModal from "./components/saved-assignments-modal";

export default function ImportPage() {
  const { orgId } = useParams();
  const [staffData, setStaffData] = useState([]);
  const [interests, setInterests] = useState([]);
  const [studentData, setStudentData] = useState([]);

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isSavedAssignmentsModalOpen, setIsSavedAssignmentsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importType, setImportType] = useState(null);
  const [loadedAssignmentData, setLoadedAssignmentData] = useState(null);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  const filteredInterests = interests.filter((interest) =>
    interest.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const applyDataFilters = (data) => {
    if (selectedInterests.length === 0 && searchQuery === "") {
      return data;
    }

    return data.filter((item) => {
      const hasSelectedInterest =
        selectedInterests.length === 0 ||
        item.interests.some((interest) => selectedInterests.includes(interest));

      const matchesSearch =
        searchQuery === "" ||
        item.interests.some((interest) =>
          interest.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      return hasSelectedInterest && matchesSearch;
    });
  };

  const filteredStaffData = applyDataFilters(staffData);
  const filteredStudentData = applyDataFilters(studentData);

  const handleImport = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setImportType(type);

    try {
      handleFileParsing(file, async (_, data) => {
        let transformedData;
        if (type === "staff") {
          const { staff, uniqueInterests } = transformStaffData(data);
          setInterests(uniqueInterests);
          setStaffData(staff);
        } else {
          transformedData = transformStudentData(data);
          setStudentData(transformedData);
        }
        setIsLoading(false);
        setImportType(null);
      });
    } catch (error) {
      toast({
        title: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      setImportType(null);
    }
  };

  const handleStaffImport = (event) => handleImport(event, "staff");
  const handleStudentImport = (event) => handleImport(event, "student");

  const updateInterests = (oldInterest, newInterests) => {
    // Filter out duplicates from newInterests that already exist in interests
    const uniqueNewInterests = newInterests.filter(
      (newInterest) => !interests.includes(newInterest),
    );

    // Update main interests array
    setInterests(
      interests.filter((i) => i !== oldInterest).concat(uniqueNewInterests),
    );

    // Update staffData only for staff who had the oldInterest
    setStaffData(
      staffData.map((staff) => {
        // Only update if this staff had the oldInterest
        if (staff.interests.includes(oldInterest)) {
          const currentInterests = staff.interests.filter(
            (i) => i !== oldInterest,
          );
          return {
            ...staff,
            interests: currentInterests.concat(newInterests),
          };
        }
        return staff; // Return unchanged if they didn't have the oldInterest
      }),
    );

    // Update studentData only for students who had the oldInterest
    setStudentData(
      studentData.map((student) => {
        // Only update if this student had the oldInterest
        if (student.interests.includes(oldInterest)) {
          const currentInterests = student.interests.filter(
            (i) => i !== oldInterest,
          );
          return {
            ...student,
            interests: currentInterests.concat(newInterests),
          };
        }
        return student; // Return unchanged if they didn't have the oldInterest
      }),
    );
  };

  const handleEditInterest = (oldInterest, newInterest) => {
    updateInterests(oldInterest, [newInterest]);
  };

  const handleSplitInterest = (oldInterest, newInterests) => {
    updateInterests(oldInterest, newInterests);
  };
  const handleToggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleLoadSavedAssignment = (savedAssignment) => {
    try {
      const hasSavedStaff = savedAssignment.staff && savedAssignment.staff.length > 0;
      const hasSavedStudents = savedAssignment.students && savedAssignment.students.length > 0;
      
      if (hasSavedStaff && hasSavedStudents) {
        setStaffData(savedAssignment.staff);
        setStudentData(savedAssignment.students);
        
        // Extract all interests for display
        const staffInterests = savedAssignment.staff.flatMap(staff => staff.interests || []);
        const studentInterests = savedAssignment.students.flatMap(student => student.interests || []);
        const uniqueInterests = [...new Set([...staffInterests, ...studentInterests])].sort();
        setInterests(uniqueInterests);
      }
      
      // Store the saved assignment for the modal to use
      setLoadedAssignmentData(savedAssignment);
      setIsSavedAssignmentsModalOpen(false);
      
      if (savedAssignment.staffAssignments && savedAssignment.staffAssignments.length > 0) {
        setIsAssignmentModalOpen(true);
      }
      
      toast({
        title: "Saved assignment loaded successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to load saved assignment",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  // Clear loaded assignment data when closing the assignment modal
  const handleCloseAssignmentModal = () => {
    setIsAssignmentModalOpen(false);
    setLoadedAssignmentData(null);
  };

  return (
    <div className="container mx-auto px-6">
      <div className="flex gap-2 mr-auto mb-4">
        <Link href={ORG_DASHBOARD(orgId)}>
          <ArrowLeft className="h-8 w-8 -ml-10 cursor-pointer" />
        </Link>
        <h1 className="text-2xl font-bold">
          Research based Allocation
        </h1>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <ImportCard
          title="Import Staff"
          handleFileChange={handleStaffImport}
          isLoading={isLoading && importType === "staff"}
        />
        <ImportCard
          title="Import Students"
          handleFileChange={handleStudentImport}
          isLoading={isLoading && importType === "student"}
        />
      </div>
      <div className="flex gap-4 mb-8">
        <Button
          className="flex-1"
          onClick={() => setIsAssignmentModalOpen(true)}
          disabled={staffData.length === 0 || studentData.length === 0}
        >
          Set Criteria & Assign Staff
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsSavedAssignmentsModalOpen(true)}
        >
          <History className="h-5 w-5 mr-2" />
          Saved Assignments
        </Button>
      </div>
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={handleCloseAssignmentModal}
        staffData={staffData}
        studentData={studentData}
        loadedAssignmentData={loadedAssignmentData}
      />
      
      <SavedAssignmentsModal 
        isOpen={isSavedAssignmentsModalOpen}
        onClose={() => setIsSavedAssignmentsModalOpen(false)}
        onLoadAssignment={handleLoadSavedAssignment}
      />
      <div className="mb-8">
        <div className="flex gap-1">
          <h2 className="text-2xl font-semibold mb-2">View/Edit Interests</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CircleAlert className="h-6 w-6 mb-2" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Editing Interests affects both staff and student data. Import
                  both before Editing.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interests..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <button
                className="absolute right-2 top-2.5"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[340px] overflow-y-auto">
          {selectedInterests.length > 0 || searchQuery ? (
            <div className="w-full mb-2 flex items-center">
              <span className="text-md mr-2">
                {selectedInterests.length > 0
                  ? "Filtering Interests:"
                  : "Searching:"}
              </span>
              <button
                className="text-md text-muted-foreground underline"
                onClick={() => {
                  setSelectedInterests([]);
                  setSearchQuery("");
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="w-full mb-2">
              <p className="text-md text-muted-foreground italic">
                Search or click on interests to filter content
              </p>
            </div>
          )}
          <div className="flex flex-wrap">
            {filteredInterests.map((interest) => (
              <InterestBadge
                key={crypto.randomUUID()}
                interest={interest}
                onEdit={handleEditInterest}
                onSplit={handleSplitInterest}
                isSelected={selectedInterests.includes(interest)}
                onToggleSelect={handleToggleInterest}
                disabled={staffData.length === 0 || studentData.length === 0}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <DataTable
          title="Staff Data"
          columns={["ID", "Name", "Interests"]}
          data={filteredStaffData}
          renderRow={(item) => (
            <TableRow key={crypto.randomUUID()}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.interests.join(", ")}</TableCell>
            </TableRow>
          )}
        />
        <DataTable
          title="Student Data"
          columns={["ID", "Name", "Course", "Interests", "Performance"]}
          data={filteredStudentData}
          renderRow={(item) => (
            <TableRow key={crypto.randomUUID()}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.course}</TableCell>
              <TableCell>{item.interests.join(", ")}</TableCell>
              <TableCell>{item?.performance}</TableCell>
            </TableRow>
          )}
        />
      </div>
    </div>
  );
}
