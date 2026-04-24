import { Box, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type InstructorRevenuePoint = {
  month: string;
  revenue: number;
};

const revenueTooltipStyle = {
  borderRadius: 14,
  border: '1px solid #E2E8F0',
  boxShadow: 'none',
};

type InstructorRevenueChartProps = {
  data?: InstructorRevenuePoint[];
};

export default function InstructorRevenueChart({ data }: InstructorRevenueChartProps) {
  const revenueData = data ?? [];

  if (revenueData.length === 0) {
    return (
      <Box
        sx={{
          height: 320,
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No revenue data available yet.
        </Typography>
      </Box>
    );
  }

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
