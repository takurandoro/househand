import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://phbdfpsherbapwzjfohq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYmRmcHNoZXJiYXB3empmb2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNzkxODEsImV4cCI6MjA2Njk1NTE4MX0.ST8wCHijzLfmz7GFmQ5VMogpLmOElQTEYM-XE6AeTd8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const HELPER_ID = '6c0231e2-43b7-4d04-ba67-76a8c751bb60';
const TASK_ID = '9bb7cfcd-f246-4028-b2d3-9e34eec9e1f5';

async function checkTaskDetails() {
  // Check the task details including bids
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select(`
      *,
      bids(*)
    `)
    .eq('id', TASK_ID)
    .single();

  if (taskError) {
    console.error('Error checking task:', taskError);
  } else {
    
    
  }

  // Check if there's a specific bid for this helper
  const { data: bid, error: bidError } = await supabase
    .from('bids')
    .select('*')
    .eq('task_id', TASK_ID)
    .eq('helper_id', HELPER_ID)
    .single();

  if (bidError) {
    console.error('\nError checking helper bid:', bidError);
  } else {
    
  }

  // Check notifications related to this task for this helper
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('*')
    .eq('task_id', TASK_ID)
    .eq('user_id', HELPER_ID);

  if (notifError) {
    console.error('\nError checking notifications:', notifError);
  } else {
    
  }
}

checkTaskDetails(); 