import Papa from "papaparse";

export const transformProjectsData = (data) => {
  const result = [];
  const allSkills = new Set();

  for (let i = 1; i < data.length; i++) {
    try {
      const row = data[i];

      if (!row[0]) {
        continue;
      }

      const skillsRequired = [];

      const skillsString = row[2] || "";

      if (skillsString) {
        const skills = skillsString
          .split(",")
          .map((skill) => skill.trim().toLowerCase());

        for (const skill of skills) {
          if (skill) {
            skillsRequired.push(skill);
            allSkills.add(skill);
          }
        }
      }

      result.push({
        id: i,
        name: row[0],
        description: row[1] || "",
        skills: skillsRequired,
      });
    } catch (error) {
      console.error("Error processing row:", data[i], error);
    }
  }

  return {
    projects: result,
    uniqueSkills: Array.from(allSkills).sort(),
  };
};

export const transformMemberData = (data) => {
  const result = [];
  const allSkills = new Set();

  for (let i = 1; i < data.length; i++) {
    try {
      const row = data[i];

      if (!row[0] || !row[1]) {
        continue;
      }

      const skills = [];
      const skillsStr = row[2] || "";

      if (skillsStr) {
        const skillItems = skillsStr
          .split(",")
          .map((skill) => skill.trim().toLowerCase());

        for (const skill of skillItems) {
          if (skill) {
            skills.push(skill);
            allSkills.add(skill);
          }
        }
      }

      result.push({
        id: i,
        name: row[0],
        email: row[1],
        skills: skills,
      });
    } catch (error) {
      console.error("Error processing row:", data[i], error);
    }
  }

  return {
    members: result,
    uniqueSkills: Array.from(allSkills).sort(),
  };
};

// Function to process the assignmentResults first for pretty csv file
// project to member assignments
function processProjectData(data) {
  let rows = [];
  // Process each project
  data.forEach((project) => {
    // Process assigned members
    project.assignedMembers.forEach((member) => {
      rows.push({
        "Project ID": project.id,
        "Project Name": project.name,
        "Project Description": project.description || "",
        "Skills Required": project.skills?.join(", ") || "",
        "Member ID": member.id,
        "Member Name": member.name,
        "Member Email": member.email || "",
        "Member Skills": member.skills?.join(", ") || "",
      });
    });
  });
  return rows;
}

export function exportProjectAssignment(jsonData) {
  // Process the data into a flat structure
  const processedData = processProjectData(jsonData);
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
  link.setAttribute("download", "project_member_assignments.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Function to process member to project assignment data for CSV export
function processMemberData(data) {
  const maxProjects = data.reduce(
    (max, member) => Math.max(max, member.assignedProjects?.length || 0),
    0,
  );

  const baseFields = ["Member ID", "Member Name", "Member Email"];
  const projectFields = Array.from({ length: maxProjects }, (_, i) => [
    `Project ${i + 1} ID`,
    `Project ${i + 1} Name`,
  ]).flat();

  return data.map((member) => {
    const row = {};

    // Initialize all fields
    [...baseFields, ...projectFields].forEach(
      (field) => (row[field] = undefined),
    );

    // Set base fields
    row["Member ID"] = member.id;
    row["Member Name"] = member.name;
    row["Member Email"] = member.email;

    // Set project fields
    member.assignedProjects?.forEach((project, index) => {
      row[`Project ${index + 1} ID`] = project.id;
      row[`Project ${index + 1} Name`] = project.name;
    });

    return row;
  });
}

export function exportMemberAssignments(jsonData) {
  // Process the data into a flat structure
  const processedData = processMemberData(jsonData);
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
  link.setAttribute("download", "member_project_assignments.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const allocate = (proj, mems, conf) => {
  var projects = proj.map((project) => {
    return { ...project, assignedMembers: [] };
  });

  var members = mems.map((member) => {
    return { ...member, assignedProjects: [] };
  });

  const config = { ...conf };

  const fairShare = config.fairShare;
  const maxProjectPerMember = config.maxProjectPerMember;

  const totalAssignmentsNeeded = members.length * maxProjectPerMember;
  const minMembersPerProject = Math.floor(
    totalAssignmentsNeeded / projects.length,
  );
  const extraMembers = totalAssignmentsNeeded % projects.length;

  const assignments = [];
  if (config.randomize) {
    members = members.sort(() => Math.random() - 0.5);
    projects = projects.sort(() => Math.random() - 0.5);
  }

  var matrix = createScoreMatrix(projects, members, config);
  var count = 0;

  while (true) {
    var wasAbleToAssign = false;
    projects.forEach((project, index) => {
      if (wasAbleToAssign) return;

      const projectLimit =
        minMembersPerProject + (index < extraMembers ? 1 : 0);
      if (fairShare && project.assignedMembers?.length >= projectLimit) return;

      const scores = matrix[index];
      const bestScore = Math.max(...scores);
      if (bestScore < 0) return;

      const indexOfBest = scores.indexOf(bestScore);
      if (indexOfBest < 0) return;
      const bestStudent = members[indexOfBest];

      for (let i = index + 1; i < projects.length; i++) {
        const projScores = matrix[i];
        const otherProjLimit =
          minMembersPerProject + (i < extraMembers ? 1 : 0);
        if (
          projScores[indexOfBest] > bestScore &&
          (!fairShare || projects[i].assignedMembers?.length < otherProjLimit)
        ) {
          return;
        }
      }

      project.assignedMembers.push({ ...bestStudent, score: bestScore });
      bestStudent.assignedProjects.push({ ...project, score: bestScore });
      count++;

      const assignment = {
        staff: project.name,
        student: bestStudent.name,
        score: bestScore,
        skills: (project.skills || []).filter((skill) =>
          bestStudent.skills?.includes(skill),
        ),
      };

      assignments.push(assignment);

      wasAbleToAssign = true;
      matrix = createScoreMatrix(projects, members, config);
    });
    if (!wasAbleToAssign) break;
  }

  console.log("Total assignments:", count);
  console.log("Assignments:", assignments);

  return { projects, members, assignments };
};

const createScoreMatrix = (projects, members, config) => {
  const matrix = [];
  projects.forEach((project) => {
    const row = [];
    members.forEach((member) => {
      row.push(calculateScore(project, member, config));
    });
    matrix.push(row);
  });
  return matrix;
};

const calculateScore = (project, member, config) => {
  const maxMembers = config.maxMembers;
  if (project.assignedMembers?.length >= maxMembers) {
    return -1;
  }

  const maxProjectPerMember = config.maxProjectsPerMember || 1;
  if (member.assignedProjects?.length >= maxProjectPerMember) {
    return -1;
  }

  if (project.assignedMembers?.includes(member)) {
    return -1;
  }

  if (!project.skills?.length) {
    return 0;
  }

  const projectSkills = project.skills || [];
  const memberSkills = member.skills;
  const commonSkills = projectSkills.filter((skill) =>
    memberSkills.includes(skill),
  );

  if (!commonSkills.length) {
    return 0;
  }

  const assignedSkills = project.assignedMembers
    .flatMap((mem) => mem.skills)
    .filter((skill) => skill);
  const totalScore = commonSkills.reduce((acc, skill) => {
    const alreadyAssigned = assignedSkills.filter(
      (assigned) => assigned === skill,
    ).length;
    const skillScore = 1 / (alreadyAssigned + 1);
    return acc + skillScore;
  }, 0);

  return totalScore / projectSkills.length;
};
