-- Create accept_bid function
CREATE OR REPLACE FUNCTION public.accept_bid(
  p_bid_id uuid,
  p_task_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Accept the selected bid
  UPDATE public.bids
  SET status = 'accepted', accepted_at = now()
  WHERE id = p_bid_id AND task_id = p_task_id;

  -- Reject all other bids for this task
  UPDATE public.bids
  SET status = 'rejected', rejected_at = now()
  WHERE task_id = p_task_id AND id <> p_bid_id AND status = 'submitted';

  -- Update the task to assign the helper and set status to 'assigned'
  UPDATE public.tasks
  SET selected_helper_id = (SELECT helper_id FROM public.bids WHERE id = p_bid_id),
      status = 'assigned'
  WHERE id = p_task_id;
END;
$$; 