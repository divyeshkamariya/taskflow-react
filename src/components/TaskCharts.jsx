import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const STATUS_COLORS = ["#f59e0b", "#3b82f6", "#22c55e"];
const CATEGORY_COLOR = "#7c3aed";

export default function TaskCharts({ stats }) {
  const { statusData, categoryData, total } = useMemo(() => {
    const s = stats || {
      total: 0,
      todo: 0,
      inProgress: 0,
      completed: 0,
      byCategory: { work: 0, study: 0, personal: 0 },
    };

    return {
      total: s.total,
      statusData: [
        { name: "Pending", value: s.todo },
        { name: "In Progress", value: s.inProgress },
        { name: "Completed", value: s.completed },
      ],
      categoryData: [
        { name: "Work", tasks: s.byCategory.work },
        { name: "Study", tasks: s.byCategory.study },
        { name: "Personal", tasks: s.byCategory.personal },
      ],
    };
  }, [stats]);

  return (
    <section
      aria-label="Task analytics"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
        gap: "20px",
        marginBottom: "28px",
      }}
    >
      <div style={cardStyle}>
        <h2 style={headingStyle}>Task Status Overview</h2>
        <p style={descriptionStyle}>Distribution of tasks by status</p>

        {total === 0 ? (
          <div style={emptyStyle}>No tasks to display yet.</div>
        ) : (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={82}
                  label={({ percent }) => `${Math.round((percent || 0) * 100)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: "var(--text)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <h2 style={headingStyle}>Tasks by Category</h2>
        <p style={descriptionStyle}>Work, Study and Personal task counts</p>

        {total === 0 ? (
          <div style={emptyStyle}>No tasks to display yet.</div>
        ) : (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 12, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: "var(--muted)" }} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--muted)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="tasks"
                  name="Tasks"
                  fill={CATEGORY_COLOR}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={65}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
};

const cardStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "20px",
  minWidth: 0,
  boxShadow: "0 4px 16px rgba(45, 30, 90, 0.04)",
};

const headingStyle = {
  fontSize: "18px",
  fontWeight: 700,
  margin: "0 0 6px",
  color: "var(--text)",
};

const descriptionStyle = {
  fontSize: "13px",
  color: "var(--muted)",
  margin: "0 0 16px",
};

const emptyStyle = {
  height: 280,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--muted)",
  textAlign: "center",
};
