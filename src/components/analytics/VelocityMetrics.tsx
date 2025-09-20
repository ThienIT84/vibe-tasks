'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, Zap, Timer } from 'lucide-react';

interface VelocityMetricsProps {
  data: {
    averageCompletionTime: number;
    tasksPerWeek: number;
    fastestTask: number;
    slowestTask: number;
  };
}

export default function VelocityMetrics({ data }: VelocityMetricsProps) {
  const metrics = [
    {
      title: 'Average Completion Time',
      value: `${data.averageCompletionTime} days`,
      icon: Clock,
      description: 'Time to complete tasks'
    },
    {
      title: 'Tasks Per Week',
      value: data.tasksPerWeek.toFixed(1),
      icon: TrendingUp,
      description: 'Productivity rate'
    },
    {
      title: 'Fastest Task',
      value: `${data.fastestTask} days`,
      icon: Zap,
      description: 'Quickest completion'
    },
    {
      title: 'Slowest Task',
      value: `${data.slowestTask} days`,
      icon: Timer,
      description: 'Longest completion'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Velocity Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
