import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useMediaQuery, useTheme } from '@mui/material';
import type { SalesByProductDataPoint } from '../../../types/dashboard.types';
import { COLORS } from '../../../constants/colors';
import { formatCurrency } from '../../../utils/formatters';
import ChartWrapper from '../ChartWrapper';

interface SalesByProductChartProps {
  data: SalesByProductDataPoint[];
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
    payload: SalesByProductDataPoint;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

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
        {data.product}
      </p>
      <p
        style={{
          margin: 0,
          color: data.color || COLORS.primary,
          fontSize: 11,
        }}
      >
        Sales: {formatCurrency(data.sales)}
      </p>
    </div>
  );
};

const SalesByProductChart: React.FC<SalesByProductChartProps> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ChartWrapper title="Sales by Product" height={{ xs: 220, sm: 260, md: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
            dataKey="product"
            tick={{ fill: COLORS.text.secondary, fontSize: isMobile ? 10 : 12 }}
            axisLine={{ stroke: COLORS.border.default }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tickFormatter={formatYAxisValue}
            tick={{ fill: COLORS.text.secondary, fontSize: isMobile ? 10 : 12 }}
            axisLine={false}
            tickLine={false}
            width={isMobile ? 35 : 45}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
          <Bar 
            dataKey="sales" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={isMobile ? 32 : 48}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS.primary}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default SalesByProductChart;
