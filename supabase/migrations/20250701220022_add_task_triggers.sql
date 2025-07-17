-- Add automatic budget calculation function
CREATE OR REPLACE FUNCTION calculate_suggested_budget(hours text, effort_level text)
RETURNS json AS $$
DECLARE
  hour_range int[];
  base_rate int;
  effort_multiplier float;
  min_hours int;
  max_hours int;
BEGIN
  -- Parse hours range or single value
  IF hours ~ '-' THEN
    -- Range format (e.g. "5-6")
    hour_range := string_to_array(hours, '-')::int[];
    min_hours := hour_range[1];
    max_hours := hour_range[2];
  ELSE
    -- Single value format (e.g. "4")
    min_hours := hours::int;
    max_hours := hours::int;
  END IF;
  
  -- Set base rate (RWF per hour)
  base_rate := 2000;
  
  -- Set effort multiplier
  effort_multiplier := CASE effort_level
    WHEN 'easy' THEN 1.0
    WHEN 'medium' THEN 1.5
    WHEN 'hard' THEN 2.0
    ELSE 1.0
  END;
  
  -- Calculate budget range
  RETURN json_build_object(
    'min', min_hours * base_rate * effort_multiplier,
    'max', max_hours * base_rate * effort_multiplier * 1.5
  );
END;
$$ LANGUAGE plpgsql; 