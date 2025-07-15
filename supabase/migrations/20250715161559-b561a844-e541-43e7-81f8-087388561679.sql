-- Add Facebook ID columns to leads table
ALTER TABLE public.leads 
ADD COLUMN fb_campaign_id TEXT,
ADD COLUMN fb_ad_id TEXT,
ADD COLUMN fb_adset_id TEXT;

-- Create indexes for better performance
CREATE INDEX idx_leads_fb_campaign_id ON public.leads(fb_campaign_id);
CREATE INDEX idx_leads_fb_ad_id ON public.leads(fb_ad_id);
CREATE INDEX idx_leads_fb_adset_id ON public.leads(fb_adset_id);