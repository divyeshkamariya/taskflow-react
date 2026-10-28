export default function StatCard({ title, count, Icon, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={21} />
      </div>
      <p>{title}</p>
      <strong>{count}</strong>
    </div>
  );
}
