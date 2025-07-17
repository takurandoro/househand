-- Drop existing policies
DROP POLICY IF EXISTS "Helpers can view open tasks" ON public.tasks;
DROP POLICY IF EXISTS "Helpers can view tasks they've applied to" ON public.tasks;

-- Add policy for helpers to view open tasks
CREATE POLICY "Helpers can view open tasks"
  ON public.tasks
  FOR SELECT
  USING (status = 'open');

-- Add policy for helpers to view tasks they've applied to
CREATE POLICY "Helpers can view tasks they've applied to"
  ON public.tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.task_applications ta
      WHERE ta.task_id = id
      AND ta.helper_id = auth.uid()
    )
  ); 