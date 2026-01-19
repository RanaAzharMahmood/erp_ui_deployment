import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useMediaQuery, useTheme } from '@mui/material';
import type { SalesVsPurchasesDataPoint } from '../../../types/dashboard.types';
import { DASHBOARD_COLORS, COLORS } from '../../../constants/colors';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import ChartWrapper from '../ChartWrapper';

interface SalesVsPurchasesChartProps {
  data: SalesVsPurchasesDataPoint[];
}

const formatXAxisDate = (dateString: string, isMobile: boolean): string => {
  if (isMobile) {
    return formatDate(dateString, { day: 'numeric' });
  }
  return formatDate(dateString, { month: 'short', day: 'numeric' });
};

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
    name: string;
    value: number;
    color: string;
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
          marginBottom: 6,
          color: COLORS.text.primary,
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        {label ? formatDate(label) : ''}
      </p>
      {payload.map((entry, index) => (
        <p
          key={index}
          style={{
            margin: 0,
            marginTop: 3,
            color: entry.color,
            fontSize: 11,
          }}
        >
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

const SalesVsPurchasesChart: React.FC<SalesVsPurchasesChartProps> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ChartWrapper title="Sales vs Purchases" height={{ xs: 220, sm: 260, md: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ 
            top: 5, 
            right: isMobile ? 5 : 20, 
            left: isMobile ? -15 : 10, 
            bottom: 5 
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.border.light}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(val) => formatXAxisDate(val, isMobile)}
            tick={{ fill: COLORS.text.secondary, fontSize: isMobile ? 10 : 12 }}
            axisLine={{ stroke: COLORS.border.default }}
            tickLine={false}
            interval={isMobile ? 1 : 0}
          />
          <YAxis
            tickFormatter={formatYAxisValue}
            tick={{ fill: COLORS.text.secondary, fontSize: isMobile ? 10 : 12 }}
            axisLine={false}
            tickLine={false}
            width={isMobile ? 35 : 45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ 
              paddingTop: isMobile ? 8 : 16,
              fontSize: isMobile ? 10 : 12,
            }}
            iconType="circle"
            iconSize={isMobile ? 6 : 8}
          />
          <Line
            type="monotone"
            dataKey="sales"
            name="Sales"
            stroke={DASHBOARD_COLORS.charts.sales}
            strokeWidth={isMobile ? 2 : 2.5}
            dot={{ 
              fill: DASHBOARD_COLORS.charts.sales, 
              strokeWidth: 0, 
              r: isMobile ? 3 : 4 
            }}
            activeDot={{ r: isMobile ? 4 : 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="purchases"
            name="Purchases"
            stroke={DASHBOARD_COLORS.charts.purchases}
            strokeWidth={isMobile ? 2 : 2.5}
            dot={{ 
              fill: DASHBOARD_COLORS.charts.purchases, 
              strokeWidth: 0, 
              r: isMobile ? 3 : 4 
            }}
            activeDot={{ r: isMobile ? 4 : 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default SalesVsPurchasesChart;
