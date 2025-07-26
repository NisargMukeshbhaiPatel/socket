import { format, parseISO } from "date-fns";
import {
  AlignLeft,
  Calendar,
  Clock,
  Eye,
  Flag,
  History,
  RefreshCw,
  Type,
  Users,
} from "lucide-react";

// Main function to extract all tasks data
export async function extractTasksData(originalObj) {
  return Promise.all(
    originalObj.map(async (taskObj) => extractTaskData(taskObj)),
  );
}

// Function to extract all tasks with history
export async function extractTasksWithHistory(originalObj) {
  return Promise.all(
    originalObj.map(async (taskObj) => extractTaskWithHistoryGrouped(taskObj)),
  );
}

async function extractTaskData(taskObj) {
  const { task } = taskObj;
  const canEdit = await taskObj.hasEditPermission();
  const doneStatusId = taskObj.pbProject.project.done_status;

  const showDoneBtn =
    canEdit && doneStatusId && doneStatusId !== task.expand?.status?.[0]?.id;

  return {
    id: task.id,
    title: task.title,
    canEdit,
    showDoneBtn,
    status: {
      id: task.expand?.status?.[0]?.id,
      name: task.expand?.status?.[0]?.name,
    },
    priority: task.priority,
    assignedTo:
      task.expand?.assigned_to
        ?.map((a) => ({
          id: a.id,
          name: a?.expand?.org_member?.expand?.user?.name,
        }))
        .filter(Boolean) || [],
    reviewers:
      task.expand?.reviewers
        ?.map((r) => ({
          id: r.id,
          name: r.expand?.org_member?.expand?.user?.name,
        }))
        .filter(Boolean) || [],
    created: task.created,
    dueDate: task.due_date
      ? new Date(task.due_date).toISOString().split("T")[0]
      : null,
    createdBy: task.expand?.created_by?.expand?.org_member?.expand?.user?.name,
    description: task.description,
  };
}

async function extractTaskWithHistoryGrouped(taskObj) {
  const taskData = await extractTaskData(taskObj);
  const taskHistory = await taskObj.getHistory();

  // Create a Map to track groups by date
  const groupsByDate = new Map();
  const historyGroups = [];

  taskHistory.forEach((record) => {
    // Transform the record first
    const transformedRecord = processHistoryRecord(record);

    const date = format(parseISO(transformedRecord.date), "yyyy-MM-dd");

    // Check if we already have a group for this date
    if (!groupsByDate.has(date)) {
      const newGroup = {
        date,
        formattedDate: format(parseISO(transformedRecord.date), "MMMM d, yyyy"),
        items: [transformedRecord],
      };

      historyGroups.push(newGroup);
      groupsByDate.set(date, newGroup);
    } else {
      // Add to existing group
      groupsByDate.get(date).items.push(transformedRecord);
    }
  });

  return {
    ...taskData,
    groupedHistory: historyGroups,
  };
}

function processHistoryRecord(record) {
  const user = record.expand.changed_by.expand.org_member.expand.user;
  const result = {
    id: record.id,
    changedBy: {
      name: user.name,
      email: user.email,
    },
    change: record.change,
    date: record.created,
  };

  switch (record.change) {
    case "TITLE":
      result.icon = <Type />;
      result.changedValue = record.title;
      break;
    case "DESC":
      result.icon = <AlignLeft />;
      result.changedValue = record.description;
      break;
    case "PRIORITY":
      result.icon = <Flag />;
      result.changedValue = record.priority;
      break;
    case "DUE_DATE":
      result.icon = <Calendar />;
      result.changedValue = record.due_date;
      break;
    case "STATUS":
      result.icon = <RefreshCw />;
      result.changedValue = record.expand?.status?.name || null;
      break;
    case "ASSIGNED_TO":
      result.icon = <Users />;
      if (record.expand?.assigned_to?.length > 0) {
        result.changedValue = record.expand.assigned_to.map((member) => ({
          email: member.expand.org_member.expand.user.email,
          name: member.expand.org_member.expand.user.name,
        }));
      } else {
        result.changedValue = [];
      }
      break;
    case "REVIEWERS":
      result.icon = <Eye />;
      if (record.expand?.reviewers?.length > 0) {
        result.changedValue = record.expand.reviewers.map((member) => ({
          email: member.expand.org_member.expand.user.email,
          name: member.expand.org_member.expand.user.name,
        }));
      } else {
        result.changedValue = [];
      }
      break;
    default:
      result.icon = <History />;
      result.changedValue = null;
  }

  return result;
}
