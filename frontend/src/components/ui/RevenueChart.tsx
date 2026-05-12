import { Box, Typography, useTheme } from '@mui/material';
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
  const theme = useTheme<import('@mui/material').Theme>();
  const revenueData = data ?? [];

  if (revenueData.length === 0) {
    return <RevenueChartEmpty height={height} />;
  }

  const dividerColor = theme.palette.divider;
  const textSecondary = theme.palette.text.secondary;
  const textPrimary = theme.palette.text.primary;
  const primaryMain = theme.palette.primary.main;

  return (
    <Box sx={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueData} barSize={barSize} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={dividerColor} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: textSecondary, fontSize: 12, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            width={34}
            tick={{ fill: textSecondary, fontSize: 12, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: `1px solid ${dividerColor}`, boxShadow: 'none', padding: '10px 12px' }}
            formatter={(value) => [`$${value ?? 0}k`, 'Revenue']}
            labelStyle={{ color: textPrimary, fontWeight: 800 }}
          />
          <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill={primaryMain} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
