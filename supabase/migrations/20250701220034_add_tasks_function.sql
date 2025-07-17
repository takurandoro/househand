-- Create a function to get tasks with bids and helper information
CREATE OR REPLACE FUNCTION get_tasks_with_bids(
  p_user_type TEXT,
  p_user_id UUID,
  p_view TEXT,
  p_location TEXT,
  p_effort_levels TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH task_data AS (
    SELECT 
      t.*,
      jsonb_agg(
        jsonb_build_object(
          'id', b.id,
          'helper_id', b.helper_id,
          'status', b.status,
          'message', b.message,
          'proposed_price', b.proposed_price,
          'created_at', b.created_at,
          'helper', jsonb_build_object(
            'id', au.id,
            'full_name', au.raw_user_meta_data->>'full_name',
            'avatar_url', au.raw_user_meta_data->>'avatar_url',
            'location', au.raw_user_meta_data->>'location'
          )
        )
      ) FILTER (WHERE b.id IS NOT NULL) AS bids,
      jsonb_build_object(
        'id', cp.id,
        'full_name', cp.full_name,
        'avatar_url', cp.avatar_url
      ) AS client,
      jsonb_build_object(
        'id', hp.id,
        'full_name', hp.full_name,
        'avatar_url', hp.avatar_url
      ) AS helper
    FROM tasks t
    LEFT JOIN bids b ON t.id = b.task_id
    LEFT JOIN auth.users au ON b.helper_id = au.id
    LEFT JOIN profiles cp ON t.client_id = cp.id
    LEFT JOIN profiles hp ON t.selected_helper_id = hp.id
    WHERE 
      CASE 
        WHEN p_user_type = 'helper' AND p_view = 'available' THEN
          t.status = 'open'
          AND (p_location IS NULL OR t.location ILIKE '%' || p_location || '%')
          AND (p_effort_levels IS NULL OR t.effort_level = ANY(p_effort_levels))
        WHEN p_user_type = 'helper' AND p_view = 'my_bids' THEN
          EXISTS (SELECT 1 FROM bids b2 WHERE b2.task_id = t.id AND b2.helper_id = p_user_id)
        WHEN p_user_type = 'helper' AND p_view = 'completed' THEN
          t.status = 'completed' AND t.selected_helper_id = p_user_id
        WHEN p_user_type = 'client' THEN
          t.client_id = p_user_id
        ELSE FALSE
      END
    GROUP BY t.id, cp.id, hp.id
    ORDER BY t.created_at DESC
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', td.id,
      'title', td.title,
      'description', td.description,
      'client_id', td.client_id,
      'selected_helper_id', td.selected_helper_id,
      'status', td.status,
      'payment_status', td.payment_status,
      'payment_amount', td.payment_amount,
      'payment_date', td.payment_date,
      'budget_min', td.budget_min,
      'budget_max', td.budget_max,
      'location', td.location,
      'category', td.category,
      'effort_level', td.effort_level,
      'hours', td.hours,
      'created_at', td.created_at,
      'updated_at', td.updated_at,
      'bids', td.bids,
      'client', td.client,
      'helper', td.helper
    )
  ) INTO v_result
  FROM task_data td;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$; 