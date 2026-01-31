import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMediaQuery, useTheme } from '@mui/material';
import type { InventoryTrendDataPoint } from '../../../types/dashboard.types';
import { DASHBOARD_COLORS, COLORS } from '../../../constants/colors';
import { formatCurrency } from '../../../utils/formatters';
import ChartWrapper from '../ChartWrapper';

interface InventoryTrendChartProps {
  data: InventoryTrendDataPoint[];
}

const formatYAxisValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: COLORS.background.paper,
        border: `1px solid ${COLORS.border.default}`,
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <p
        style={{
          margin: 0,
          marginBottom: 4,
          color: COLORS.text.primary,
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          color: DASHBOARD_COLORS.charts.inventory,
          fontSize: 11,
        }}
      >
        Value: {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

const InventoryTrendChart: React.FC<InventoryTrendChartProps> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ChartWrapper title="Inventory Value Trend" height={{ xs: 180, sm: 220, md: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ 
            top: 5, 
            right: isMobile ? 5 : 20, 
            left: isMobile ? -15 : 10, 
            bottom: 5 
          }}
        >
          <defs>
            <linearGradient id="inventoryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={DASHBOARD_COLORS.charts.inventory}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={DASHBOARD_COLORS.charts.inventory}
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.border.light}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: COLORS.text.secondary, fontSize: isMobile ? 9 : 12 }}
            axisLine={{ stroke: COLORS.border.default }}
            tickLine={false}
            interval={isMobile ? 2 : 0}
          />
          <YAxis
            tickFormatter={formatYAxisValue}
            tick={{ fill: COLORS.text.secondary, fontSize: isMobile ? 10 : 12 }}
            axisLine={false}
            tickLine={false}
            width={isMobile ? 35 : 45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={DASHBOARD_COLORS.charts.inventory}
            strokeWidth={isMobile ? 2 : 2.5}
            fill="url(#inventoryGradient)"
            dot={false}
            activeDot={{
              r: isMobile ? 4 : 6,
              fill: DASHBOARD_COLORS.charts.inventory,
              strokeWidth: 0,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default InventoryTrendChart;
