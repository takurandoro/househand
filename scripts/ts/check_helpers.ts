import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://phbdfpsherbapwzjfohq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYmRmcHNoZXJiYXB3empmb2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNzkxODEsImV4cCI6MjA2Njk1NTE4MX0.ST8wCHijzLfmz7GFmQ5VMogpLmOElQTEYM-XE6AeTd8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countHelpers() {
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('user_type', 'helper');

  if (error) {
    console.error('Error:', error);
    return;
  }

  
  
}

countHelpers(); 