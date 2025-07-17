-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    helper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Clients can create reviews for their tasks"
    ON public.reviews
    FOR INSERT
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can view reviews"
    ON public.reviews
    FOR SELECT
    USING (true);

-- Add has_review column to tasks
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS has_review BOOLEAN DEFAULT false;

-- Create function to update helper rating
CREATE OR REPLACE FUNCTION update_helper_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the helper's rating in their profile
    WITH helper_stats AS (
        SELECT 
            helper_id,
            ROUND(AVG(rating)::numeric, 1) as avg_rating,
            COUNT(*) as total_reviews
        FROM public.reviews
        WHERE helper_id = NEW.helper_id
        GROUP BY helper_id
    )
    UPDATE public.profiles
    SET 
        rating = helper_stats.avg_rating,
        review_count = helper_stats.total_reviews
    FROM helper_stats
    WHERE id = helper_stats.helper_id;

    -- Update the task's has_review status
    UPDATE public.tasks
    SET has_review = true
    WHERE id = NEW.task_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating helper rating
CREATE TRIGGER update_helper_rating_trigger
    AFTER INSERT ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_helper_rating();

-- Add rating and review_count columns to profiles if they don't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0; 