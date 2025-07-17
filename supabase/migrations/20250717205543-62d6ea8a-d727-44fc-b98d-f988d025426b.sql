-- Create Facebook insights table for storing detailed ad performance data
CREATE TABLE public.facebook_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  adset_id TEXT,
  adset_name TEXT,
  ad_id TEXT,
  ad_name TEXT,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  spend NUMERIC(10,2) NOT NULL DEFAULT 0,
  cpm NUMERIC(10,2) NOT NULL DEFAULT 0,
  cpc NUMERIC(10,2) NOT NULL DEFAULT 0,
  ctr NUMERIC(5,2) NOT NULL DEFAULT 0,
  date_start DATE NOT NULL,
  date_stop DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.facebook_insights ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since this is for internal analytics)
CREATE POLICY "Allow all operations on facebook_insights" 
ON public.facebook_insights 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_facebook_insights_campaign_id ON public.facebook_insights(campaign_id);
CREATE INDEX idx_facebook_insights_adset_id ON public.facebook_insights(adset_id);
CREATE INDEX idx_facebook_insights_ad_id ON public.facebook_insights(ad_id);
CREATE INDEX idx_facebook_insights_date_range ON public.facebook_insights(date_start, date_stop);

-- Create unique constraint to prevent duplicates
CREATE UNIQUE INDEX idx_facebook_insights_unique 
ON public.facebook_insights(campaign_id, COALESCE(adset_id, ''), COALESCE(ad_id, ''), date_start);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_facebook_insights_updated_at
BEFORE UPDATE ON public.facebook_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();