import fetch from 'node-fetch';

const projectRef = 'phbdfpsherbapwzjfohq';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYmRmcHNoZXJiYXB3empmb2hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM3OTE4MSwiZXhwIjoyMDY2OTU1MTgxfQ.zrJLIVzoxoNnS0m0OgU42c7YNMo4TIEAU5dx4bcmCeU';

async function executeSql() {
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        query: `
          -- Add missing columns to tasks table
          ALTER TABLE public.tasks 
          ADD COLUMN IF NOT EXISTS effort_level text,
          ADD COLUMN IF NOT EXISTS hours text,
          ADD COLUMN IF NOT EXISTS payment_status BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS payment_amount INTEGER,
          ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;

          -- Drop existing constraint if it exists
          ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_effort_level_check;

          -- Add updated constraint that allows null values
          ALTER TABLE public.tasks
          ADD CONSTRAINT tasks_effort_level_check 
          CHECK (effort_level IS NULL OR effort_level = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text]));

          -- Update existing tasks to have payment_status = false
          UPDATE public.tasks SET payment_status = FALSE WHERE payment_status IS NULL;

          -- Make payment_status non-nullable after setting default value
          ALTER TABLE public.tasks ALTER COLUMN payment_status SET NOT NULL;
        `
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to execute SQL: ${error}`);
    }

    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}

async function main() {
  try {
    await executeSql();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 