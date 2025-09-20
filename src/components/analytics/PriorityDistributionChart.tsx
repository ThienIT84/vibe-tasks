'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PriorityDistributionChartProps {
  data: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
}

const COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b', 
  High: '#f97316',
  Urgent: '#ef4444'
};

export default function PriorityDistributionChart({ data }: PriorityDistributionChartProps) {
  return (
    <div className="h-80 w-full">
      <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ priority, percentage }) => `${priority}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.priority as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string, props: any) => [
              `${value} tasks (${props.payload.percentage}%)`,
              props.payload.priority
            ]}
          />
          <Legend 
            formatter={(value) => value}
            wrapperStyle={{ fontSize: '14px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
