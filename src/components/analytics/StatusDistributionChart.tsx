'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatusDistributionChartProps {
  data: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

const STATUS_COLORS = {
  'Pending': '#f59e0b',
  'In Progress': '#3b82f6',
  'Done': '#10b981',
  'Archived': '#6b7280'
};

export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  return (
    <div className="h-80 w-full">
      <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="status" 
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number, name: string, props: any) => [
              `${value} tasks (${props.payload.percentage}%)`,
              props.payload.status
            ]}
          />
          <Bar 
            dataKey="count" 
            fill={(entry: any) => STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
