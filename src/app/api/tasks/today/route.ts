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

    // Get today's date (start of day in local timezone)
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Format dates as YYYY-MM-DD for comparison
    const todayStr = startOfToday.toISOString().split('T')[0];
    const tomorrowStr = startOfTomorrow.toISOString().split('T')[0];
    
    // For testing: also include tomorrow's tasks
    const dayAfterTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];

    console.log('=== TODAY TASKS API DEBUG ===');
    console.log('User ID:', user.id);
    console.log('Today range:', {
      todayStr,
      tomorrowStr,
      startOfToday: startOfToday.toISOString(),
      startOfTomorrow: startOfTomorrow.toISOString()
    });

    // First, let's check all tasks for this user
    const { data: allUserTasks, error: allTasksError } = await supabase
      .from('tasks')
      .select('id, title, due_date, status, priority')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (allTasksError) {
      console.error('Error fetching all user tasks:', allTasksError);
    }

    console.log('All user tasks:', {
      count: allUserTasks?.length || 0,
      tasks: allUserTasks?.map(t => ({ 
        id: t.id, 
        title: t.title, 
        due_date: t.due_date, 
        status: t.status,
        priority: t.priority
      }))
    });

    // Check if any tasks have due_date matching today
    const tasksWithTodayDueDate = allUserTasks?.filter(t => t.due_date === todayStr) || [];
    console.log('Tasks with due_date matching today:', {
      count: tasksWithTodayDueDate.length,
      tasks: tasksWithTodayDueDate
    });

    // Get tasks due today and tomorrow (for testing)
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .in('due_date', [todayStr, tomorrowStr])  // Include today and tomorrow
      .order('due_date', { ascending: true });

    console.log('Due today tasks query result:', {
      count: tasks?.length || 0,
      tasks: tasks?.map(t => ({ id: t.id, title: t.title, due_date: t.due_date }))
    });

    // Get overdue tasks (due before today and not completed)
    const { data: overdueTasks, error: overdueError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .lt('due_date', todayStr)
      .in('status', ['pending', 'in_progress'])
      .order('due_date', { ascending: true });

    console.log('Overdue tasks query result:', {
      count: overdueTasks?.length || 0,
      tasks: overdueTasks?.map(t => ({ id: t.id, title: t.title, due_date: t.due_date }))
    });

    if (error) {
      console.error('Error fetching today tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch today tasks', details: error.message }, { status: 500 });
    }

    if (overdueError) {
      console.error('Error fetching overdue tasks:', overdueError);
      return NextResponse.json({ error: 'Failed to fetch overdue tasks' }, { status: 500 });
    }

    // Also get tasks without due_date that are pending/in_progress (for today's work)
    const { data: workTasks, error: workError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'in_progress'])
      .is('due_date', null)
      .order('inserted_at', { ascending: false })
      .limit(5); // Limit to 5 most recent tasks without due date

    console.log('Work tasks query result:', {
      count: workTasks?.length || 0,
      tasks: workTasks?.map(t => ({ id: t.id, title: t.title, due_date: t.due_date }))
    });

    if (workError) {
      console.error('Error fetching work tasks:', workError);
      return NextResponse.json({ error: 'Failed to fetch work tasks', details: workError.message }, { status: 500 });
    }

    // Combine and deduplicate tasks
    const allTasks = [...(overdueTasks || []), ...(tasks || []), ...(workTasks || [])];
    const uniqueTasks = allTasks.filter((task, index, self) => 
      index === self.findIndex(t => t.id === task.id)
    );

    // Categorize tasks
    const todayTasks = {
      overdue: overdueTasks || [],
      dueToday: tasks || [],
      workTasks: workTasks || [],
      allTasks: uniqueTasks,
      totalCount: uniqueTasks.length
    };

    console.log('Tasks categorized:', {
      overdue: todayTasks.overdue.length,
      dueToday: todayTasks.dueToday.length,
      workTasks: todayTasks.workTasks.length,
      total: todayTasks.totalCount
    });

    return NextResponse.json({ tasks: todayTasks });
  } catch (error) {
    console.error('Today Tasks API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
