import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
export default function TaskCalendar({ tasks, onEdit }) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const year = month.getFullYear(),
    index = month.getMonth();
  const offset = new Date(year, index, 1).getDay(),
    days = new Date(year, index + 1, 0).getDate();
  const cells = Array.from(
    { length: Math.ceil((offset + days) / 7) * 7 },
    (_, i) => i - offset + 1,
  );
  const shift = (n) => setMonth(new Date(year, index + n, 1));
  return (
    <section className="feature-panel" aria-label="Task calendar">
      <div className="feature-heading">
        <h2>
          <CalendarDays size={20} /> Calendar View
        </h2>
        <div className="feature-actions">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month">
            <ChevronLeft />
          </button>
          <strong>{month.toLocaleString(undefined, { month: "long", year: "numeric" })}</strong>
          <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month">
            <ChevronRight />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div className="calendar-weekday" key={d}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const date =
            day > 0 && day <= days
              ? `${year}-${String(index + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              : null;
          const entries = date ? tasks.filter((t) => t.dueDate === date) : [];
          return (
            <div key={i} className={`calendar-day ${!date ? "calendar-blank" : ""}`}>
              <span>{date ? day : ""}</span>
              {entries.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  className={`calendar-task ${t.status === "Completed" ? "calendar-done" : ""}`}
                  title={t.title}
                  onClick={() => onEdit(t)}
                >
                  {t.title}
                </button>
              ))}
              {entries.length > 3 && <small>+{entries.length - 3} more</small>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
