import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { FormNotificationEmail } from "./_templates/form-notification.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  leadData: {
    nome: string;
    telefone: string;
    email: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    cep: string;
    complemento?: string;
    modalidade_compra: string;
    tipo_tratamento: string;
    preco_tratamento: string;
    dia_agenda?: string;
    horario_agenda?: string;
  };
  utmData?: any;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadData, utmData, timestamp }: NotificationRequest = await req.json();

    console.log("Processando envio de e-mail para novo lead:", leadData.nome);

    // Preparar dados para o template
    console.log('Dados do tratamento recebidos:', { 
      tipo_tratamento: leadData.tipo_tratamento, 
      preco_tratamento: leadData.preco_tratamento 
    });
    
    const emailData = {
      nome: leadData.nome,
      telefone: leadData.telefone,
      email: leadData.email,
      endereco: {
        rua: leadData.rua,
        numero: leadData.numero,
        bairro: leadData.bairro,
        cidade: leadData.cidade,
        cep: leadData.cep,
        complemento: leadData.complemento,
      },
      modalidade: leadData.modalidade_compra,
      tratamento: {
        tipo: leadData.tipo_tratamento,
        preco: leadData.preco_tratamento,
      },
      agendamento: leadData.dia_agenda && leadData.horario_agenda ? {
        dia: leadData.dia_agenda,
        horario: leadData.horario_agenda,
      } : undefined,
      utmData,
      timestamp,
    };

    // Renderizar template de e-mail
    const html = await renderAsync(
      React.createElement(FormNotificationEmail, emailData)
    );

    // Enviar e-mail
    const emailResponse = await resend.emails.send({
      from: "Monja Slim <onboarding@resend.dev>",
      to: ["nccapss@gmail.com"],
      subject: `🎯 Novo Lead: ${leadData.nome} - ${leadData.modalidade_compra}`,
      html,
    });

    console.log("E-mail enviado com sucesso:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Erro ao enviar e-mail de notificação:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);