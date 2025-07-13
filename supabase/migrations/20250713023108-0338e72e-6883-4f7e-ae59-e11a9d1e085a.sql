-- Add delivery and payment tracking fields to leads table
ALTER TABLE public.leads 
ADD COLUMN delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed')),
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'unpaid')),
ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN delivery_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN delivery_notes TEXT,
ADD COLUMN payment_notes TEXT;

-- Create index for delivery management queries
CREATE INDEX idx_leads_delivery_status ON public.leads(delivery_status);
CREATE INDEX idx_leads_payment_status ON public.leads(payment_status);
CREATE INDEX idx_leads_modalidade_compra ON public.leads(modalidade_compra);