import { useState } from "react";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";

const COLUMNS = [
  { id: "Pending", label: "To Do" },
  { id: "In Progress", label: "In Progress" },
  { id: "Completed", label: "Completed" },
];

// Drag a card to another column (mouse) or use the "Move to" menu (keyboard / touch).
export default function KanbanBoard({ tasks, limited = false, onMove, onEdit, onDelete }) {
  const [dragId, setDragId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const endDrag = () => {
    setDragId(null);
    setOverColumn(null);
  };

  const handleDrop = (event, columnId) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain") || dragId;
    const task = tasks.find((t) => t.id === id);

    endDrag();

    if (task && task.status !== columnId) {
      onMove(task, columnId);
    }
  };

  return (
    <section className="feature-panel" aria-label="Kanban board">
      <div className="feature-heading">
        <h2>Kanban Board</h2>
        <span className="feature-muted">Drag cards between columns to change their status</span>
      </div>

      {limited && (
        <p className="feature-muted" role="status">
          Showing your 300 most recent tasks.
        </p>
      )}

      <div className="kanban">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className={`kanban-column ${overColumn === column.id ? "kanban-over" : ""}`}
              data-testid={`column-${column.id}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (overColumn !== column.id) setOverColumn(column.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setOverColumn(null);
                }
              }}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <h3 className="kanban-title">
                {column.label}
                <span className="kanban-count">{columnTasks.length}</span>
              </h3>

              <div className="kanban-cards">
                {columnTasks.length === 0 && <p className="kanban-empty">Drop tasks here</p>}

                {columnTasks.map((task) => (
                  <article
                    key={task.id}
                    className={`kanban-card ${dragId === task.id ? "kanban-dragging" : ""}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", task.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragId(task.id);
                    }}
                    onDragEnd={endDrag}
                  >
                    <div className="kanban-card-top">
                      <strong>{task.title}</strong>
                      <span className={`priority priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="kanban-card-meta">
                      <span className="kanban-tag">{task.category}</span>
                      {task.dueDate && (
                        <span className="kanban-due">
                          <CalendarDays size={13} /> {task.dueDate}
                        </span>
                      )}
                    </div>

                    <div className="kanban-card-actions">
                      <select
                        aria-label={`Move ${task.title} to another column`}
                        value={task.status}
                        onChange={(e) => onMove(task, e.target.value)}
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => onEdit(task)}
                        aria-label={`Edit ${task.title}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => onDelete(task.id)}
                        aria-label={`Delete ${task.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
