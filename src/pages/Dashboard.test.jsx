import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

import App from "../App";
import { TASKS_KEY } from "../utils/storage";

const readSaved = () => JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");

const addTaskThroughForm = async (user, title, extra = {}) => {
  await user.click(screen.getAllByRole("button", { name: /new task|add task/i })[0]);
  const dialog = await screen.findByRole("dialog", {}, { timeout: 2000 }).catch(() => null);
  const scope = dialog ? within(dialog) : screen;
  await user.type(scope.getByLabelText(/title/i), title);
  if (extra.priority) await user.selectOptions(scope.getByLabelText(/priority/i), extra.priority);
  await user.click(scope.getByRole("button", { name: /create task|save|add task/i }));
};

// Opens settings and clicks "Load sample data" inside the dialog
const loadSamples = async (user) => {
  await user.click(screen.getByRole("button", { name: /open settings/i }));
  const dialog = screen.getByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: /load sample data/i }));
};

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

describe("TaskFlow (frontend only, localStorage)", () => {
  it("starts empty and offers sample data", () => {
    render(<App />);
    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /load sample data/i })).toBeInTheDocument();
  });

  it("creates a task and saves it to localStorage", async () => {
    const user = userEvent.setup();
    render(<App />);

    await addTaskThroughForm(user, "Learn React hooks");

    expect(await screen.findByText("Learn React hooks")).toBeInTheDocument();
    expect(readSaved()).toHaveLength(1);
    expect(readSaved()[0]).toMatchObject({ title: "Learn React hooks", status: "Pending" });
  });

  it("restores saved tasks after a reload", () => {
    localStorage.setItem(
      TASKS_KEY,
      JSON.stringify([{ id: "a", title: "Saved earlier", createdAt: new Date().toISOString() }]),
    );
    render(<App />);
    expect(screen.getByText("Saved earlier")).toBeInTheDocument();
  });

  it("loads sample data from settings and shows stats", async () => {
    const user = userEvent.setup();
    render(<App />);

    await loadSamples(user);

    expect(readSaved()).toHaveLength(10);
    expect(screen.getByText("10 tasks found")).toBeInTheDocument();
    expect(screen.getByLabelText("Task statistics")).toBeInTheDocument();
  });

  it("searches, filters and paginates locally", async () => {
    const user = userEvent.setup();
    render(<App />);
    await loadSamples(user);

    // 10 sample tasks, 5 per page
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();

    // search goes back to page 1 and narrows the list
    await user.type(screen.getByLabelText("Search tasks"), "readme");
    expect(screen.getByText("1 task found")).toBeInTheDocument();
    expect(screen.getByText("Finish React project README")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Search tasks"));
    fireEvent.change(screen.getByLabelText("Filter by category"), { target: { value: "study" } });
    expect(screen.getByText("3 tasks found")).toBeInTheDocument();
  });

  it("marks a task complete and can delete it", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      TASKS_KEY,
      JSON.stringify([{ id: "a", title: "Finish me", createdAt: new Date().toISOString() }]),
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Complete Finish me" }));
    expect(readSaved()[0].status).toBe("Completed");

    await user.click(screen.getByRole("button", { name: "Delete Finish me" }));
    expect(readSaved()).toHaveLength(0);
  });

  it("moves a task on the Kanban board and persists it", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      TASKS_KEY,
      JSON.stringify([{ id: "a", title: "Drag me", createdAt: new Date().toISOString() }]),
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Kanban Board" }));
    fireEvent.change(screen.getByLabelText("Move Drag me to another column"), {
      target: { value: "In Progress" },
    });

    expect(readSaved()[0].status).toBe("In Progress");
    expect(
      within(screen.getByTestId("column-In Progress")).getByText("Drag me"),
    ).toBeInTheDocument();
  });

  it("saves the user's name and greets them", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /open settings/i }));
    await user.type(screen.getByLabelText("Your name"), "Rahul");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: /close settings/i }));

    expect(screen.getByText("Welcome back, Rahul 👋")).toBeInTheDocument();
  });

  it("opens the new task form with the N shortcut", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.keyboard("n");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
