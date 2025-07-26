export async function POST(request) {
  try {
    const {
      staffData,
      studentData,
      maxStudents,
      maxStaffPerStudent,
      fairShare,
      randomize,
      interestBias,
      departmentBias,
      performanceBias,
    } = await request.json();

    const assignments = allocate(staffData, studentData, {
      maxStudents,
      maxStaffPerStudent,
      fairShare,
      randomize,
      interestBias,
      departmentBias,
      performanceBias,
    });

    return new Response(JSON.stringify(assignments), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in allocation:", error);
    return new Response(
      JSON.stringify({
        error: error.message || error.toString(),
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

const calculateScore = (staffMember, student, config) => {
  const maxStudents = config.maxStudents;
  if (staffMember.assignedStudents?.length >= maxStudents) {
    return -1;
  }

  const maxStaffPerStudent = config.maxStaffPerStudent || 1;
  if (student.assignedStaff?.length >= maxStaffPerStudent) {
    return -1;
  }

  if (staffMember.assignedStudents?.includes(student)) {
    return -1;
  }

  const interestBias = config.interestBias === undefined ? 1 : config.interestBias;
  const departmentBias = config.departmentBias === undefined ? 0.5 : config.departmentBias;
  const performanceBias = config.performanceBias === undefined ? 0.5 : config.performanceBias;

  const staffInterests = staffMember.interests || [];
  const studentInterests = student.interests;
  const interestScore = staffInterests ?
    (staffInterests.filter((interest) => studentInterests.includes(interest)).length / staffInterests.length)
    : 0;

  const staffDepartments = staffMember.assignedStudents?.map((student) => student.course) || [];
  const studentDepartment = student.course;
  const departmentScore = staffDepartments.includes(studentDepartment) ? 0 : 1;

  const averagePerformance = config.averagePerformance || 1;
  const staffPerformances = staffMember.assignedStudents?.map((student) => student.performance || 0) || [];
  staffPerformances.push(student.performance || 0);
  const staffPerformance = staffPerformances.reduce((acc, performance) => acc + performance, 0) / staffPerformances.length;
  const performanceScore = 1 - Math.abs(staffPerformance - averagePerformance) / averagePerformance;

  const score = (interestScore * interestBias) + (departmentScore * departmentBias) + (performanceScore * performanceBias);
  return score;
}

const createScoreMatrix = (staff, students, config) => {
  const matrix = [];
  staff.forEach((staffMember) => {
    const row = [];
    students.forEach((student) => {
      row.push(calculateScore(staffMember, student, config));
    });
    matrix.push(row);
  });
  return matrix;
}

export const allocate = (staf, student, conf) => {
  var staff = staf.map((staffMember) => {
    return { ...staffMember, assignedStudents: [] };
  });

  var students = student.map((student) => {
    return { ...student, assignedStaff: [] };
  });

  const config = { ...conf };

  const fairShare = config.fairShare;
  const maxStaffPerStudent = config.maxStaffPerStudent;

  // Calculate minimum and maximum students per staff for even distribution
  const totalAssignmentsNeeded = students.length * maxStaffPerStudent;
  const minStudentsPerStaff = Math.floor(totalAssignmentsNeeded / staff.length);
  const extraStudents = totalAssignmentsNeeded % staff.length;

  const studentsWithPerformance = students.filter((student) => student.performance);
  if (studentsWithPerformance.length === 0) {
    config.performanceBias = 0;
    config.averagePerformance = 1;
  } else {
    config.averagePerformance = studentsWithPerformance
      .reduce((acc, student) => acc + student.performance, 0) / studentsWithPerformance.length;
  }

  const assignments = [];
  if (config.randomize) {
    students = students.sort(() => Math.random() - 0.5);
    staff = staff.sort(() => Math.random() - 0.5);
  }

  var matrix = createScoreMatrix(staff, students, config);
  var count = 0;

  while (true) {
    var wasAbleToAssign = false;
    staff.forEach((staffMember, index) => {
      if (wasAbleToAssign) return;

      // Skip if this staff member has reached their allocation limit
      const staffLimit = minStudentsPerStaff + (index < extraStudents ? 1 : 0);
      if (fairShare && staffMember.assignedStudents?.length >= staffLimit) return;

      const scores = matrix[index];
      const bestScore = Math.max(...scores);
      if (bestScore < 0) return;

      const indexOfBest = scores.indexOf(bestScore);
      if (indexOfBest < 0) return;
      const bestStudent = students[indexOfBest];

      for (let i = index + 1; i < staff.length; i++) {
        const stafScores = matrix[i];
        const otherStaffLimit = minStudentsPerStaff + (i < extraStudents ? 1 : 0);
        // Allow assignment to current staff if other staff already reached their limit
        if (stafScores[indexOfBest] > bestScore &&
          (!fairShare || staff[i].assignedStudents?.length < otherStaffLimit)) {
          return;
        }
      }

      staffMember.assignedStudents = staffMember.assignedStudents || [];
      staffMember.assignedStudents.push(bestStudent);

      bestStudent.assignedStaff = bestStudent.assignedStaff || [];
      bestStudent.assignedStaff.push(staffMember);
      count++;

      const assignment = {
        staff: staffMember.name,
        student: bestStudent.name,
      };
      assignments.push(assignment);

      wasAbleToAssign = true;
      matrix = createScoreMatrix(staff, students, config);
    });
    if (!wasAbleToAssign) break;
  }

  console.log("Total assignments:", count);
  console.log("Assignments:", assignments);

  return { staff, students, assignments };
}
