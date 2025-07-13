-- Create leads table for storing all form submissions
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Personal data
  nome TEXT,
  telefone TEXT,
  email TEXT,
  cep TEXT,
  rua TEXT,
  bairro TEXT,
  cidade TEXT,
  numero TEXT,
  complemento TEXT,
  
  -- Form data
  modalidade_compra TEXT,
  tipo_tratamento TEXT,
  preco_tratamento TEXT,
  dia_agenda TEXT,
  horario_agenda TEXT,
  aceite_final BOOLEAN DEFAULT false,
  data_preenchimento TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Tracking data
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  fbclid TEXT,
  fb_source TEXT,
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  
  -- Conversion data
  total_time_seconds INTEGER,
  completed_steps INTEGER,
  final_action TEXT,
  conversion_value TEXT
);

-- Create funnel_events table for tracking user journey
CREATE TABLE public.funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  step_number INTEGER,
  time_on_step_seconds INTEGER,
  form_data_snapshot JSONB,
  utm_data JSONB
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (no user authentication required)
CREATE POLICY "Allow all operations on leads" 
ON public.leads 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on funnel_events" 
ON public.funnel_events 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on leads
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_leads_session_id ON public.leads(session_id);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_funnel_events_lead_id ON public.funnel_events(lead_id);
CREATE INDEX idx_funnel_events_event_type ON public.funnel_events(event_type);
CREATE INDEX idx_funnel_events_timestamp ON public.funnel_events(timestamp);