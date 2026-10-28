import { addDays, getLocalToday } from "./taskFilters";
import { createId } from "./storage";

// Demo tasks with dates relative to today, so the dashboard always looks alive
export function createSampleTasks() {
  const today = getLocalToday();
  const now = Date.now();

  const samples = [
    [
      "Finish React project README",
      "Add screenshots, features and setup steps.",
      "In Progress",
      "High",
      "work",
      1,
    ],
    [
      "Fix responsive navbar bug",
      "Menu overlaps the search box below 400px.",
      "Pending",
      "High",
      "work",
      -2,
    ],
    [
      "Revise JavaScript closures",
      "Practice 5 interview questions on closures.",
      "Pending",
      "Medium",
      "study",
      2,
    ],
    ["Solve 3 array problems", "Two pointers and sliding window.", "Pending", "Medium", "study", 0],
    [
      "Push portfolio to GitHub",
      "Clean commit history and add a live demo link.",
      "Completed",
      "High",
      "work",
      -1,
    ],
    ["Go for a 30 minute walk", "", "Pending", "Low", "personal", 0],
    ["Plan next week's study schedule", "", "Pending", "Low", "personal", 5],
    [
      "Learn CSS Grid basics",
      "Build a 3 column layout from scratch.",
      "In Progress",
      "Medium",
      "study",
      4,
    ],
    [
      "Update resume with new project",
      "Add TaskFlow and the live link.",
      "Pending",
      "High",
      "work",
      3,
    ],
    ["Read a chapter of Clean Code", "", "Completed", "Low", "personal", -3],
  ];

  return samples.map(([title, description, status, priority, category, offset], index) => ({
    id: createId(),
    title,
    description,
    status,
    priority,
    category,
    dueDate: addDays(today, offset),
    createdAt: new Date(now - index * 60 * 60 * 1000).toISOString(),
  }));
}
