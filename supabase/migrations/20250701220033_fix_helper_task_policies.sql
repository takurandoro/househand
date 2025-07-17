-- Drop existing policies
DROP POLICY IF EXISTS "Helpers can view tasks they've applied to" ON public.tasks;

-- Add policy for helpers to view tasks they are selected for
CREATE POLICY "Helpers can view tasks they are selected for"
  ON public.tasks
  FOR SELECT
  USING (selected_helper_id = auth.uid());

-- Add policy for helpers to view tasks they've bid on
CREATE POLICY "Helpers can view tasks they've bid on"
  ON public.tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bids b
      WHERE b.task_id = id
      AND b.helper_id = auth.uid()
    )
  ); 