import { Bell } from "lucide-react";
import { getReminders, getLocalToday } from "../utils/taskFilters";

// Overdue tasks and tasks due within the next 3 days (calculated from local data)
export default function TaskReminders({ tasks }) {
  const reminders = getReminders(tasks, getLocalToday(), 3);

  return (
    <section className="feature-panel" aria-label="Deadline reminders">
      <div className="feature-heading">
        <h2>
          <Bell size={20} /> Task Reminders
        </h2>
        <span className="feature-muted">Next 3 days + overdue</span>
      </div>

      {reminders.length === 0 ? (
        <p className="feature-muted">No urgent deadlines. You&apos;re on track!</p>
      ) : (
        <div className="reminder-list">
          {reminders.slice(0, 10).map((r) => (
            <div key={r.id} className="reminder-item">
              <span className={`reminder-pill ${r.type}`}>{r.type}</span>
              <strong>{r.title}</strong>
              <time dateTime={r.dueDate}>
                {new Date(`${r.dueDate}T00:00:00`).toLocaleDateString()}
              </time>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
