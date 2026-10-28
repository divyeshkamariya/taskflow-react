import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createId, loadTasks, sanitizeTask, saveTasks } from "../utils/storage";

// All task data lives here. The list is loaded from localStorage once
// and saved again every time it changes.
export default function useTasks() {
  const [tasks, setTasks] = useState(loadTasks);

  // Save to localStorage after every change
  useEffect(() => {
    if (!saveTasks(tasks)) {
      toast.error("Could not save your tasks. Browser storage is full or blocked.", {
        id: "save-failed",
      });
    }
  }, [tasks]);

  const addTask = useCallback((data) => {
    const task = sanitizeTask({
      ...data,
      id: createId(),
      createdAt: new Date().toISOString(),
    });
    if (!task) throw new Error("Task title is required.");

    setTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  const updateTask = useCallback((id, changes) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        // keep id and createdAt, validate everything else again
        return (
          sanitizeTask({ ...task, ...changes, id: task.id, createdAt: task.createdAt }) ?? task
        );
      }),
    );
  }, []);

  const removeTask = useCallback((id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const replaceAll = useCallback((list) => setTasks(list), []);

  return { tasks, addTask, updateTask, removeTask, replaceAll };
}
