import Papa from "papaparse";

export const transformStaffData = (data) => {
  const result = [];
  const allInterests = new Set(); // Using Set for unique interests
  // Start from 1 to skip header
  for (let i = 1; i < data.length; i++) {
    try {
      const row = data[i];
      // Skip invalid rows
      if (!row[0] || !row[1]) {
        //no id no name
        continue;
      }
      const interests = [];
      // Process interests string directly
      const interestsString = row[3]
        .replace(/^\d+\.?\s*/, "")
        .replace(/�/g, "")
        .trim()
        .toLowerCase(); // Convert to lowercase immediately

      if (interestsString) {
        let currentInterest = "";
        // Manual string parsing to avoid split and map
        for (let char of interestsString) {
          if (char === ",") {
            if (currentInterest.trim()) {
              const trimmedInterest = currentInterest.trim();
              interests.push(trimmedInterest);
              allInterests.add(trimmedInterest);
            }
            currentInterest = "";
          } else {
            currentInterest += char;
          }
        }
        // Don't forget the last interest
        if (currentInterest.trim()) {
          const trimmedInterest = currentInterest.trim();
          interests.push(trimmedInterest);
          allInterests.add(trimmedInterest);
        }
      }
      result.push({
        id: row[0],
        name: row[1],
        email: row[2],
        interests,
      });
    } catch (error) {
      console.error("Error processing row:", data[i], error);
    }
  }
  return {
    staff: result,
    uniqueInterests: Array.from(allInterests).sort(),
  };
};

export const transformStudentData = (data) => {
  const result = [];
  // Start from 1 to skip header
  for (let i = 1; i < data.length; i++) {
    try {
      const row = data[i];
      const interests = [];
      // Skip invalid rows
      if (!row[0] || !row[1]) {
        //no id no name
        continue;
      }
      // Process both research interest columns
      for (let colIndex of [5, 6, 7, 8, 9, 10]) {
        const interestStr = row[colIndex];
        if (!interestStr) continue;
        let currentInterest = "";
        const cleanedStr = interestStr
          .replace(/^\d+\.?\s*�?\s*/, "")
          .trim()
          .toLowerCase(); // Convert to lowercase immediately

        // Manual string parsing
        for (let char of cleanedStr) {
          if (char === ",") {
            if (currentInterest.trim()) {
              interests.push(currentInterest.trim());
            }
            currentInterest = "";
          } else {
            currentInterest += char;
          }
        }
        // Add the last interest
        if (currentInterest.trim()) {
          interests.push(currentInterest.trim());
        }
      }
      result.push({
        id: row[0],
        name: row[1],
        email: row[2],
        course: row[3],
        performance: row[4] ? parseFloat(row[4]) : undefined,
        interests,
      });
    } catch (error) {
      console.error("Error processing row:", data[i], error);
    }
  }
  return result;
};

// Function to process the assignmentResults first for pretty csv file
// staff to student assgn
function processStaffData(data) {
  let rows = [];
  // Process each supervisor
  data.forEach((supervisor) => {
    // Process assigned students
    supervisor.assignedStudents.forEach((student) => {
      rows.push({
        "Supervisor ID": supervisor.id,
        "Supervisor Name": supervisor.name,
        "Supervior Email": supervisor.email || "",
        "Student ID": student.id,
        "Student Name": student.name,
        "Student Course": student.course,
        "Student Performance": student.performance || "",
        "Student Email": student.email || "",
      });
    });
  });

  return rows;
}

export function exportAssignmentResults(jsonData) {
  // Process the data into a flat structure
  const processedData = processStaffData(jsonData);

  // Configure Papa Parse options
  const config = {
    quotes: true,
    delimiter: ",",
    header: true,
  };

  // Convert to CSV
  const csv = Papa.unparse(processedData, config);
  // Create download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", "supervisor_student_assignments.csv");
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Function to process student to staff assignment data for CSV export
function processStudentData(data) {
  const maxSupervisors = data.reduce(
    (max, student) => Math.max(max, student.assignedStaff?.length || 0),
    0,
  );

  const baseFields = [
    "SCJ Code",
    "Full Name",
    "Student E-mail Address",
    "Course Name",
  ];
  const supervisorFields = Array.from({ length: maxSupervisors }, (_, i) =>
    i === 0
      ? ["First Supervisor", "First Supervisor Email"]
      : [`Supervisor ${i + 1}`, `Supervisor ${i + 1} Email`],
  ).flat();

  return data.map((student) => {
    const row = {};

    // Initialize all fields
    [...baseFields, ...supervisorFields].forEach(
      (field) => (row[field] = undefined),
    );

    // Set base fields
    row["SCJ Code"] = student.id;
    row["Full Name"] = student.name;
    row["Student E-mail Address"] = student.email;
    row["Course Name"] = student.course;

    // Set supervisor fields
    student.assignedStaff?.forEach((staff, index) => {
      if (index === 0) {
        row["First Supervisor"] = staff.name;
        row["First Supervisor Email"] = staff.email;
      } else {
        row[`Supervisor ${index + 1}`] = staff.name;
        row[`Supervisor ${index + 1} Email`] = staff.email;
      }
    });

    return row;
  });
}

export function exportStudentAssignments(jsonData) {
  // Process the data into a flat structure
  const processedData = processStudentData(jsonData);

  // Configure Papa Parse options
  const config = {
    quotes: true,
    delimiter: ",",
    header: true,
  };

  // Convert to CSV
  const csv = Papa.unparse(processedData, config);

  // Create download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "student_staff_assignments.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
