import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  try {
    // Debug cookies
    console.log('Request cookies:', request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op in route handlers
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth check result:', { user: user?.id, error: authError?.message });
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication error', details: authError.message }, { status: 401 });
    }
    
    if (!user) {
      console.log('No user found in session');
      return NextResponse.json({ error: 'Unauthorized - no user session' }, { status: 401 });
    }

    // Get today's date in local timezone
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
    
    console.log('Date comparison:', {
      today: todayStr,
      tomorrow: tomorrowStr,
      currentTime: new Date().toISOString(),
      currentDate: new Date().toDateString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    console.log('=== TODAY TASKS API DEBUG ===');
    console.log('User ID:', user.id);
    console.log('Today range:', {
      todayStr,
      tomorrowStr,
      currentTime: new Date().toISOString()
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

    // Get tasks due today (not completed)
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('due_date', todayStr)
      .neq('status', 'done')
      .order('due_date', { ascending: true });

    console.log('Due today tasks query result:', {
      count: tasks?.length || 0,
      tasks: tasks?.map(t => ({ id: t.id, title: t.title, due_date: t.due_date })),
      queryCondition: `due_date = '${todayStr}'`
    });

    // Get overdue tasks (due before today and not completed)
    const { data: overdueTasks, error: overdueError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .lt('due_date', todayStr)
      .neq('status', 'done')
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

    // Combine tasks
    const allTasks = [...(overdueTasks || []), ...(tasks || [])];
    const uniqueTasks = allTasks.filter((task, index, self) => 
      index === self.findIndex(t => t.id === task.id)
    );

    // Categorize tasks
    const todayTasks = {
      overdue: overdueTasks || [],
      dueToday: tasks || [],
      totalCount: uniqueTasks.length
    };

    console.log('Tasks categorized:', {
      overdue: todayTasks.overdue.length,
      dueToday: todayTasks.dueToday.length,
      total: todayTasks.totalCount
    });

    // Debug: Log individual tasks
    console.log('Overdue tasks details:', todayTasks.overdue.map(t => ({ 
      id: t.id, 
      title: t.title, 
      due_date: t.due_date, 
      status: t.status 
    })));
    console.log('Due today tasks details:', todayTasks.dueToday.map(t => ({ 
      id: t.id, 
      title: t.title, 
      due_date: t.due_date, 
      status: t.status 
    })));

    return NextResponse.json({ tasks: todayTasks });
  } catch (error) {
    console.error('Today Tasks API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
