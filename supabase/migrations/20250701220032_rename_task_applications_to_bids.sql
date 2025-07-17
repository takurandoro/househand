-- Rename task_applications table to bids
ALTER TABLE public.task_applications RENAME TO bids;

-- Update foreign key constraints
ALTER TABLE public.bids RENAME CONSTRAINT task_applications_task_id_fkey TO bids_task_id_fkey;
ALTER TABLE public.bids RENAME CONSTRAINT task_applications_helper_id_fkey TO bids_helper_id_fkey;

-- Drop existing policies
DROP POLICY IF EXISTS "Helpers can view their own applications" ON public.bids;
DROP POLICY IF EXISTS "Helpers can create applications" ON public.bids;
DROP POLICY IF EXISTS "Clients can view applications for their tasks" ON public.bids;

-- Create new policies with updated names
CREATE POLICY "Helpers can view their own bids"
  ON public.bids
  FOR SELECT
  USING (auth.uid() = helper_id);

CREATE POLICY "Helpers can create bids"
  ON public.bids
  FOR INSERT
  WITH CHECK (auth.uid() = helper_id);

CREATE POLICY "Clients can view bids for their tasks"
  ON public.bids
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id
      AND t.client_id = auth.uid()
    )
  );

-- Update function references
CREATE OR REPLACE FUNCTION public.sync_helper_earnings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert earnings records for all paid tasks that don't have records yet
  INSERT INTO public.helper_earnings (helper_id, task_id, amount, status)
  SELECT 
    b.helper_id,
    t.id,
    t.payment_amount,
    'paid'
  FROM public.tasks t
  JOIN public.bids b ON t.id = b.task_id
  WHERE t.payment_status = true
    AND b.status = 'accepted'
    AND NOT EXISTS (
      SELECT 1 
      FROM public.helper_earnings he 
      WHERE he.task_id = t.id
    );
END;
$$; 