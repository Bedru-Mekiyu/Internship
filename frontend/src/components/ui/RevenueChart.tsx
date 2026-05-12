import { Box, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type RevenuePoint = {
  month: string;
  revenue: number;
};

type RevenueChartProps = {
  data?: RevenuePoint[];
  height?: number;
  barSize?: number;
};

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 'none',
  padding: '10px 12px',
};

function RevenueChartEmpty({ height = 300 }: { height: number }) {
  return (
    <Box
      sx={{
        height,
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

export default function RevenueChart({ data, height = 300, barSize = 22 }: RevenueChartProps) {
  const revenueData = data ?? [];

  if (revenueData.length === 0) {
    return <RevenueChartEmpty height={height} />;
  }

  return (
    <Box sx={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueData} barSize={barSize} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="divider" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: 'text.secondary', fontSize: 12, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            width={34}
            tick={{ fill: 'text.secondary', fontSize: 12, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [`$${value ?? 0}k`, 'Revenue']}
            labelStyle={{ color: 'text.primary', fontWeight: 800 }}
          />
          <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="primary.main" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
