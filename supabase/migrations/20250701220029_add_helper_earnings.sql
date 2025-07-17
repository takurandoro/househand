-- Create helper earnings table
CREATE TABLE public.helper_earnings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    helper_id uuid NOT NULL,
    task_id uuid NOT NULL,
    amount integer NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT helper_earnings_pkey PRIMARY KEY (id),
    CONSTRAINT helper_earnings_helper_id_fkey FOREIGN KEY (helper_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT helper_earnings_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE,
    CONSTRAINT helper_earnings_status_check CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text]))
);

-- Enable RLS on helper_earnings
ALTER TABLE public.helper_earnings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for helper_earnings
CREATE POLICY "Helpers can view their own earnings"
  ON public.helper_earnings
  FOR SELECT
  USING (helper_id = auth.uid());

CREATE POLICY "System can insert helper earnings"
  ON public.helper_earnings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update helper earnings"
  ON public.helper_earnings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create function to process task payment and create earnings record
CREATE OR REPLACE FUNCTION public.process_task_payment(
  p_task_id uuid,
  p_helper_id uuid,
  p_amount integer
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task_data json;
  v_existing_earnings uuid;
BEGIN
  -- Check for existing earnings record
  SELECT id INTO v_existing_earnings
  FROM public.helper_earnings
  WHERE task_id = p_task_id AND helper_id = p_helper_id;

  IF v_existing_earnings IS NOT NULL THEN
    RAISE EXCEPTION 'Earnings record already exists for this task';
  END IF;

  -- Get task data
  SELECT json_build_object(
    'id', id,
    'title', title,
    'payment_status', payment_status,
    'payment_amount', payment_amount,
    'payment_date', payment_date
  ) INTO v_task_data
  FROM public.tasks
  WHERE id = p_task_id;

  -- If task is not paid yet, update payment status
  IF NOT (v_task_data->>'payment_status')::boolean THEN
    UPDATE public.tasks
    SET payment_status = true,
        payment_amount = p_amount,
        payment_date = now()
    WHERE id = p_task_id
    RETURNING json_build_object(
      'id', id,
      'title', title,
      'payment_status', payment_status,
      'payment_amount', payment_amount,
      'payment_date', payment_date
    ) INTO v_task_data;
  END IF;

  -- Create helper earnings record
  INSERT INTO public.helper_earnings (
    helper_id,
    task_id,
    amount,
    status
  ) VALUES (
    p_helper_id,
    p_task_id,
    p_amount,
    'paid'
  );

  RETURN v_task_data;
END;
$$;

-- Create function to sync existing paid tasks
CREATE OR REPLACE FUNCTION public.sync_helper_earnings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert earnings records for all paid tasks that don't have records yet
  INSERT INTO public.helper_earnings (helper_id, task_id, amount, status)
  SELECT 
    ta.helper_id,
    t.id,
    t.payment_amount,
    'paid'
  FROM public.tasks t
  JOIN public.task_applications ta ON t.id = ta.task_id
  WHERE t.payment_status = true
    AND ta.status = 'accepted'
    AND NOT EXISTS (
      SELECT 1 
      FROM public.helper_earnings he 
      WHERE he.task_id = t.id
    );
END;
$$;

-- Sync existing paid tasks
SELECT public.sync_helper_earnings(); 