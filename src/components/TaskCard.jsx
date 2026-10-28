import {
  CalendarDays,
  Check,
  Pencil,
  Trash2,
  BriefcaseBusiness,
  BookOpen,
  UserRound,
  AlertTriangle,
  Clock3,
  CheckCircle2,
} from "lucide-react";

const CATEGORY_CONFIG = {
  work: {
    label: "Work",
    Icon: BriefcaseBusiness,
    background: "#dbeafe",
    color: "#1d4ed8",
  },
  study: {
    label: "Study",
    Icon: BookOpen,
    background: "#f3e8ff",
    color: "#7e22ce",
  },
  personal: {
    label: "Personal",
    Icon: UserRound,
    background: "#dcfce7",
    color: "#15803d",
  },
};

// Compare date-only values using the user's local date.
function getLocalToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDeadlineInfo(task) {
  if (task.status === "Completed") {
    return {
      label: "Completed",
      Icon: CheckCircle2,
      background: "#dcfce7",
      color: "#15803d",
    };
  }

  if (!task.dueDate) {
    return null;
  }

  const today = getLocalToday();
  const dueDate = task.dueDate;

  if (dueDate < today) {
    return {
      label: "Overdue",
      Icon: AlertTriangle,
      background: "#fee2e2",
      color: "#b91c1c",
    };
  }

  if (dueDate === today) {
    return {
      label: "Due Today",
      Icon: Clock3,
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  return {
    label: "Upcoming",
    Icon: CalendarDays,
    background: "#dbeafe",
    color: "#1d4ed8",
  };
}

export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const category = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.personal;

  const CategoryIcon = category.Icon;

  const deadline = getDeadlineInfo(task);
  const DeadlineIcon = deadline?.Icon;

  return (
    <article className="task-card">
      <div className="task-main">
        <div className="task-title-row">
          <h3>{task.title}</h3>

          <span className={`priority priority-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>

        <p className="task-desc">{task.description || "No description provided"}</p>

        {/* Category and Deadline Badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 10px",
              borderRadius: "8px",
              backgroundColor: category.background,
              color: category.color,
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <CategoryIcon size={14} />
            {category.label}
          </span>

          {deadline && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 10px",
                borderRadius: "8px",
                backgroundColor: deadline.background,
                color: deadline.color,
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <DeadlineIcon size={14} />
              {deadline.label}
            </span>
          )}
        </div>

        <div className="task-meta">
          <span>
            <CalendarDays size={15} />
            {task.dueDate || "No due date"}
          </span>

          <span className={`status status-${task.status.toLowerCase().replaceAll(" ", "-")}`}>
            {task.status}
          </span>
        </div>
      </div>

      <div className="task-actions">
        <button
          type="button"
          title="Mark complete"
          aria-label={`Complete ${task.title}`}
          className="icon-btn"
          onClick={() => onComplete(task.id)}
          disabled={task.status === "Completed"}
        >
          <Check size={18} />
        </button>

        <button
          type="button"
          title="Edit task"
          aria-label={`Edit ${task.title}`}
          className="icon-btn"
          onClick={() => onEdit(task)}
        >
          <Pencil size={17} />
        </button>

        <button
          type="button"
          title="Delete task"
          aria-label={`Delete ${task.title}`}
          className="icon-btn danger"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}
