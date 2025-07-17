-- Create task_category enum type
CREATE TYPE task_category AS ENUM ('cleaning', 'gardening', 'moving', 'home_maintenance', 'other');

-- Create application_status enum type
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');

-- Create the tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category task_category NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  selected_helper_id UUID,
  payment_date TIMESTAMPTZ,
  min_price INTEGER NOT NULL DEFAULT 0,
  max_price INTEGER NOT NULL DEFAULT 0
);

-- Create task applications table
CREATE TABLE IF NOT EXISTS public.task_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  helper_id UUID NOT NULL,
  message TEXT,
  proposed_price INTEGER,
  status application_status DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  CONSTRAINT task_applications_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE,
  CONSTRAINT task_applications_helper_id_fkey FOREIGN KEY (helper_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create RLS policies for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Helpers can view open tasks"
  ON public.tasks
  FOR SELECT
  USING (status = 'open');

CREATE POLICY "Users can create their own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = client_id);

-- Create RLS policies for task applications
ALTER TABLE public.task_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Helpers can view their own applications"
  ON public.task_applications
  FOR SELECT
  USING (auth.uid() = helper_id);

CREATE POLICY "Helpers can create applications"
  ON public.task_applications
  FOR INSERT
  WITH CHECK (auth.uid() = helper_id);

CREATE POLICY "Clients can view applications for their tasks"
  ON public.task_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id
      AND t.client_id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT ALL ON TABLE public.tasks TO anon;
GRANT ALL ON TABLE public.task_applications TO authenticated;
GRANT ALL ON TABLE public.task_applications TO anon;
