export interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
  fb_source: string;
}

export interface TrackingData extends UTMParams {
  timestamp_acesso: string;
  user_agent: string;
  referrer: string;
  page_url: string;
  session_id: string;
}

export interface FunnelEvent {
  event: string;
  timestamp: string;
  step: number;
  utm_data: UTMParams;
  form_data?: any;
  time_on_step?: number;
}

export interface ConversionData {
  total_time: string;
  completed_steps: number;
  final_action: 'redirect_to_site' | 'success_page' | 'abandoned';
  conversion_value?: string;
}

export interface FullTrackingPayload {
  lead_data: any;
  tracking_data: TrackingData;
  funnel_events: FunnelEvent[];
  conversion_data: ConversionData;
}

export type FunnelEventType = 
  | 'page_view'
  | 'step_1_modalidade'
  | 'step_2_dados_pessoais' 
  | 'step_3_tratamento'
  | 'treatment_selection_made'
  | 'treatment_next_clicked'
  | 'step_4_agendamento'
  | 'step_5_revisao'
  | 'form_submit'
  | 'redirect_to_site'
  | 'step_back'
  | 'step_edit';