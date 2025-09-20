'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductivityTrendsChartProps {
  data: Array<{
    date: string;
    tasksCreated: number;
    tasksCompleted: number;
  }>;
}

export default function ProductivityTrendsChart({ data }: ProductivityTrendsChartProps) {
  return (
    <div className="h-80 w-full">
      <h3 className="text-lg font-semibold mb-4">Productivity Trends (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number, name: string) => [
              value, 
              name === 'tasksCreated' ? 'Tasks Created' : 'Tasks Completed'
            ]}
            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          />
          <Bar dataKey="tasksCreated" fill="#3b82f6" name="Created" />
          <Bar dataKey="tasksCompleted" fill="#10b981" name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
