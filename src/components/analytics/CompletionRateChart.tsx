'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CompletionRateChartProps {
  data: Array<{
    date: string;
    completionRate: number;
    totalTasks: number;
    completedTasks: number;
  }>;
}

export default function CompletionRateChart({ data }: CompletionRateChartProps) {
  return (
    <div className="h-80 w-full">
      <h3 className="text-lg font-semibold mb-4">Task Completion Rate Over Time</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `${value}%`, 
              name === 'completionRate' ? 'Completion Rate' : name
            ]}
            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          />
          <Line 
            type="monotone" 
            dataKey="completionRate" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
