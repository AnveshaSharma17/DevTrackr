import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  open: '#2563eb',
  merged: '#238636',
  closed: '#6b7280',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
        {payload[0].name}: {payload[0].value}
      </p>
      <p style={{ color: 'var(--text-muted)' }}>
        {payload[0].payload.percent}%
      </p>
    </div>
  );
};

const PRAnalyticsChart = ({ prStats }) => {
  if (!prStats) return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No PR data available</p>
    </div>
  );

  const total = prStats.total || 0;
  if (total === 0) return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No pull requests found</p>
    </div>
  );

  const data = [
    { name: 'Open', value: prStats.open, percent: total ? Math.round((prStats.open / total) * 100) : 0 },
    { name: 'Merged', value: prStats.merged, percent: total ? Math.round((prStats.merged / total) * 100) : 0 },
    { name: 'Closed', value: prStats.closed, percent: total ? Math.round((prStats.closed / total) * 100) : 0 },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name.toLowerCase()] || '#8b949e'}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: 8 }}>
        {data.map((item) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 2,
              background: COLORS[item.name.toLowerCase()] || '#8b949e',
            }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>

      {/* Merge Rate */}
      <div style={{
        marginTop: 12,
        padding: '8px 12px',
        background: 'var(--bg-elevated)',
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Merge Rate</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-green-text)' }}>
          {prStats.mergeRate}%
        </span>
      </div>
    </div>
  );
};

export default PRAnalyticsChart;
