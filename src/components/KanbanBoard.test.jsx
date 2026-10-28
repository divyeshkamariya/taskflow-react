import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import KanbanBoard from "./KanbanBoard";

const tasks = [
  {
    id: "1",
    title: "Todo task",
    status: "Pending",
    priority: "High",
    category: "work",
    dueDate: "2030-01-01",
  },
  {
    id: "2",
    title: "Doing task",
    status: "In Progress",
    priority: "Low",
    category: "study",
    dueDate: "",
  },
  {
    id: "3",
    title: "Done task",
    status: "Completed",
    priority: "Medium",
    category: "personal",
    dueDate: "",
  },
];

const setup = (props = {}) => {
  const handlers = { onMove: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() };
  render(<KanbanBoard tasks={tasks} {...handlers} {...props} />);
  return handlers;
};

describe("KanbanBoard", () => {
  it("puts each task in the column for its status", () => {
    setup();
    expect(within(screen.getByTestId("column-Pending")).getByText("Todo task")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("column-In Progress")).getByText("Doing task"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("column-Completed")).getByText("Done task"),
    ).toBeInTheDocument();
  });

  it("moves a task when it is dropped on another column", () => {
    const { onMove } = setup();
    const dataTransfer = {
      data: {},
      setData(k, v) {
        this.data[k] = v;
      },
      getData(k) {
        return this.data[k];
      },
      effectAllowed: "",
      dropEffect: "",
    };

    const card = screen.getByText("Todo task").closest("article");
    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragOver(screen.getByTestId("column-Completed"), { dataTransfer });
    fireEvent.drop(screen.getByTestId("column-Completed"), { dataTransfer });

    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }), "Completed");
  });

  it("does nothing when dropped on the same column", () => {
    const { onMove } = setup();
    const dataTransfer = {
      data: {},
      setData(k, v) {
        this.data[k] = v;
      },
      getData(k) {
        return this.data[k];
      },
    };
    const card = screen.getByText("Todo task").closest("article");
    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.drop(screen.getByTestId("column-Pending"), { dataTransfer });
    expect(onMove).not.toHaveBeenCalled();
  });

  it('offers a keyboard / touch friendly "move" menu, edit and delete', () => {
    const { onMove, onEdit, onDelete } = setup();

    fireEvent.change(screen.getByLabelText("Move Todo task to another column"), {
      target: { value: "In Progress" },
    });
    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }), "In Progress");

    fireEvent.click(screen.getByLabelText("Edit Doing task"));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: "2" }));

    fireEvent.click(screen.getByLabelText("Delete Done task"));
    expect(onDelete).toHaveBeenCalledWith("3");
  });

  it("shows a note when the list is capped", () => {
    setup({ limited: true });
    expect(screen.getByRole("status")).toHaveTextContent("300 most recent");
  });
});
