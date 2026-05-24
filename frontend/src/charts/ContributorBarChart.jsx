import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CONTRIBUTOR_COLORS = ['#238636', '#2563eb', '#7c3aed', '#0891b2', '#ea580c', '#ca8a04'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{label}</p>
      <p style={{ color: 'var(--text-muted)' }}>{payload[0].value} commits</p>
    </div>
  );
};

const ContributorBarChart = ({ contributors = [] }) => {
  if (!contributors.length) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No contributor data</p>
      </div>
    );
  }

  const data = contributors.map((c) => ({
    name: c.username,
    commits: c.totalCommits,
    isActive: c.isActive,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="commits" radius={[0, 4, 4, 0]} barSize={12}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isActive
                ? CONTRIBUTOR_COLORS[index % CONTRIBUTOR_COLORS.length]
                : 'var(--border-default)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ContributorBarChart;
