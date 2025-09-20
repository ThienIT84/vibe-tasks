import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase-route-handler';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all tasks for the user
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('inserted_at', { ascending: true });

    if (error) {
      console.error('Error fetching tasks for analytics:', error);
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter tasks for different time periods
    const allTasks = tasks || [];
    const last30DaysTasks = allTasks.filter(task => 
      new Date(task.inserted_at) >= thirtyDaysAgo
    );
    const last7DaysTasks = allTasks.filter(task => 
      new Date(task.inserted_at) >= sevenDaysAgo
    );

    // 1. Task completion rate over time (last 30 days)
    const completionRateOverTime = calculateCompletionRateOverTime(last30DaysTasks);

    // 2. Priority distribution pie chart
    const priorityDistribution = calculatePriorityDistribution(allTasks);

    // 3. Productivity trends (tasks created per day - last 7 days)
    const productivityTrends = calculateProductivityTrends(last7DaysTasks);

    // 4. Task velocity metrics
    const velocityMetrics = calculateVelocityMetrics(allTasks);

    // 5. Status distribution
    const statusDistribution = calculateStatusDistribution(allTasks);

    // 6. Recent activity
    const recentActivity = calculateRecentActivity(allTasks);

    const analytics = {
      completionRateOverTime,
      priorityDistribution,
      productivityTrends,
      velocityMetrics,
      statusDistribution,
      recentActivity,
      summary: {
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter(t => t.status === 'done').length,
        pendingTasks: allTasks.filter(t => t.status === 'pending').length,
        inProgressTasks: allTasks.filter(t => t.status === 'in_progress').length,
        completionRate: allTasks.length > 0 ? 
          Math.round((allTasks.filter(t => t.status === 'done').length / allTasks.length) * 100) : 0
      }
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateCompletionRateOverTime(tasks: any[]) {
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTasks = tasks.filter(task => 
      task.inserted_at.startsWith(dateStr)
    );
    
    const completedTasks = dayTasks.filter(task => task.status === 'done');
    const completionRate = dayTasks.length > 0 ? 
      Math.round((completedTasks.length / dayTasks.length) * 100) : 0;

    last30Days.push({
      date: dateStr,
      completionRate,
      totalTasks: dayTasks.length,
      completedTasks: completedTasks.length
    });
  }
  return last30Days;
}

function calculatePriorityDistribution(tasks: any[]) {
  const priorityCounts = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0
  };

  tasks.forEach(task => {
    priorityCounts[task.priority as keyof typeof priorityCounts]++;
  });

  return Object.entries(priorityCounts).map(([priority, count]) => ({
    priority: priority.charAt(0).toUpperCase() + priority.slice(1),
    count,
    percentage: tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0
  }));
}

function calculateProductivityTrends(tasks: any[]) {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTasks = tasks.filter(task => 
      task.inserted_at.startsWith(dateStr)
    );

    last7Days.push({
      date: dateStr,
      tasksCreated: dayTasks.length,
      tasksCompleted: dayTasks.filter(t => t.status === 'done').length
    });
  }
  return last7Days;
}

function calculateVelocityMetrics(tasks: any[]) {
  const completedTasks = tasks.filter(t => t.status === 'done');
  
  if (completedTasks.length === 0) {
    return {
      averageCompletionTime: 0,
      tasksPerWeek: 0,
      fastestTask: 0,
      slowestTask: 0
    };
  }

  // Calculate average completion time in days
  const completionTimes = completedTasks.map(task => {
    const created = new Date(task.inserted_at);
    const completed = new Date(task.updated_at);
    return Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  });

  const averageCompletionTime = Math.round(
    completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
  );

  // Calculate tasks per week (last 4 weeks)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const recentCompletedTasks = completedTasks.filter(task => 
    new Date(task.updated_at) >= fourWeeksAgo
  );

  const tasksPerWeek = Math.round((recentCompletedTasks.length / 4) * 10) / 10;

  return {
    averageCompletionTime,
    tasksPerWeek,
    fastestTask: Math.min(...completionTimes),
    slowestTask: Math.max(...completionTimes)
  };
}

function calculateStatusDistribution(tasks: any[]) {
  const statusCounts = {
    pending: 0,
    in_progress: 0,
    done: 0,
    archived: 0
  };

  tasks.forEach(task => {
    statusCounts[task.status as keyof typeof statusCounts]++;
  });

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    count,
    percentage: tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0
  }));
}

function calculateRecentActivity(tasks: any[]) {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTasks = tasks.filter(task => 
      task.inserted_at.startsWith(dateStr) || 
      (task.updated_at && task.updated_at.startsWith(dateStr))
    );

    last7Days.push({
      date: dateStr,
      activities: dayTasks.length,
      created: dayTasks.filter(t => t.inserted_at.startsWith(dateStr)).length,
      updated: dayTasks.filter(t => 
        t.updated_at && t.updated_at.startsWith(dateStr) && 
        !t.inserted_at.startsWith(dateStr)
      ).length
    });
  }
  return last7Days;
}
