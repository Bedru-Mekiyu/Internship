import { Box, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const revenueTooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(226, 232, 240, 0.9)',
  boxShadow: 'none',
  padding: '10px 12px',
};

export type AnalyticsRevenuePoint = {
  month: string;
  revenue: number;
};

type AnalyticsRevenueChartProps = {
  data?: AnalyticsRevenuePoint[];
};

export default function AnalyticsRevenueChart({ data }: AnalyticsRevenueChartProps) {
  const revenueData = data ?? [];

  if (revenueData.length === 0) {
    return (
      <Box
        sx={{
          height: 300,
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
    <Box sx={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueData} barSize={22} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis width={34} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={revenueTooltipStyle}
            formatter={(value) => [`$${value ?? 0}k`, 'Revenue']}
            labelStyle={{ color: '#1E2937', fontWeight: 800 }}
          />
          <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="#0066FF" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
