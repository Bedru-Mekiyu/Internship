import { Box } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 22 },
  { month: 'Feb', revenue: 28 },
  { month: 'Mar', revenue: 25 },
  { month: 'Apr', revenue: 34 },
  { month: 'May', revenue: 39 },
  { month: 'Jun', revenue: 45 },
];

const revenueTooltipStyle = {
  borderRadius: 14,
  border: '1px solid #E2E8F0',
  boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
};

export default function InstructorRevenueChart() {
  return (
    <Box sx={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueData} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={revenueTooltipStyle}
            formatter={(value) => [`$${value ?? 0}k`, 'Revenue']}
          />
          <Bar dataKey="revenue" radius={[10, 10, 0, 0]} fill="#0066FF" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
