import { useEffect, useState } from "react";
import { X } from "lucide-react";

const blank = {
  title: "",
  description: "",
  priority: "Medium",
  status: "Pending",
  category: "personal",
  dueDate: "",
};

const ALLOWED_CATEGORIES = ["work", "study", "personal"];

export default function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task ? { ...blank, ...task } : { ...blank });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // The modal is mounted fresh every time it opens, so the form
  // is initialised from `task` above and needs no syncing effect.

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, saving]);

  const change = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      setError("Task title is required.");
      return;
    }

    if (title.length > 100) {
      setError("Task title cannot exceed 100 characters.");
      return;
    }

    if (description.length > 1000) {
      setError("Description cannot exceed 1000 characters.");
      return;
    }

    if (!ALLOWED_CATEGORIES.includes(form.category)) {
      setError("Please select a valid category.");
      return;
    }

    if (form.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.dueDate)) {
      setError("Please select a valid due date.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        ...form,
        title,
        description,
        category: form.category,
      });

      // Parent Dashboard handles modal closing.
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to save task. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-head">
          <h2 id="modal-title">{task ? "Edit Task" : "Create New Task"}</h2>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
            disabled={saving}
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={submit} className="task-form">
          <label>
            Task Title *
            <input
              autoFocus
              required
              maxLength={100}
              name="title"
              value={form.title ?? ""}
              onChange={change}
              placeholder="e.g. Finish React dashboard"
              disabled={saving}
            />
            <small
              style={{
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              {(form.title ?? "").length}/100 characters
            </small>
          </label>

          <label>
            Description
            <textarea
              rows={3}
              maxLength={1000}
              name="description"
              value={form.description ?? ""}
              onChange={change}
              placeholder="Add details..."
              disabled={saving}
            />
            <small
              style={{
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              {(form.description ?? "").length}/1000 characters
            </small>
          </label>

          <div className="form-grid">
            <label>
              Priority
              <select name="priority" value={form.priority} onChange={change} disabled={saving}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={change} disabled={saving}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
          </div>

          {/* New Category Field */}
          <label>
            Category
            <select name="category" value={form.category} onChange={change} disabled={saving}>
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="study">Study</option>
            </select>
          </label>

          <label>
            Due Date
            <input
              type="date"
              name="dueDate"
              value={form.dueDate ?? ""}
              onChange={change}
              disabled={saving}
            />
          </label>

          {error && (
            <p
              role="alert"
              style={{
                padding: "12px",
                background: "#fef2f2",
                color: "#dc2626",
                borderRadius: "8px",
                fontSize: "14px",
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
