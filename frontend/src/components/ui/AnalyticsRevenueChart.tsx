import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 42 },
  { month: 'Feb', revenue: 48 },
  { month: 'Mar', revenue: 51 },
  { month: 'Apr', revenue: 56 },
  { month: 'May', revenue: 60 },
  { month: 'Jun', revenue: 63 },
  { month: 'Jul', revenue: 67 },
  { month: 'Aug', revenue: 72 },
  { month: 'Sep', revenue: 76 },
  { month: 'Oct', revenue: 80 },
  { month: 'Nov', revenue: 86 },
  { month: 'Dec', revenue: 93 },
];

const revenueTooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(226, 232, 240, 0.9)',
  boxShadow: '0 10px 24px rgba(15,23,42,0.08)',
  padding: '10px 12px',
};

export default function AnalyticsRevenueChart() {
  return (
    <Box sx={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueData} barSize={22} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis width={34} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: alpha('#0066FF', 0.04) }}
            contentStyle={revenueTooltipStyle}
            formatter={(value) => [`$${value ?? 0}k`, 'Revenue']}
            labelStyle={{ color: '#1E2937', fontWeight: 800 }}
          />
          <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
            {revenueData.map((entry, index) => {
              const fill = index % 3 === 1 ? '#8B5CF6' : '#0066FF';
              return <Cell key={entry.month} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
