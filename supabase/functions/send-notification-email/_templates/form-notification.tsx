import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface FormNotificationEmailProps {
  nome: string
  telefone: string
  email: string
  endereco: {
    rua: string
    numero: string
    bairro: string
    cidade: string
    cep: string
    complemento?: string
  }
  modalidade: string
  tratamento: {
    tipo: string
    preco: string
  }
  agendamento?: {
    dia: string
    horario: string
  }
  utmData?: any
  timestamp: string
}

export const FormNotificationEmail = ({
  nome,
  telefone,
  email,
  endereco,
  modalidade,
  tratamento,
  agendamento,
  utmData,
  timestamp,
}: FormNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Novo formulário preenchido - Monja Slim</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎯 Novo Lead - Monja Slim</Heading>
        
        <Text style={text}>
          <strong>Data/Hora:</strong> {timestamp}
        </Text>

        <Section style={section}>
          <Heading style={h2}>👤 Dados Pessoais</Heading>
          <Text style={text}>
            <strong>Nome:</strong> {nome}<br/>
            <strong>Telefone:</strong> {telefone}<br/>
            <strong>E-mail:</strong> {email}
          </Text>
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Heading style={h2}>📍 Endereço</Heading>
          <Text style={text}>
            <strong>Rua:</strong> {endereco.rua}, {endereco.numero}<br/>
            <strong>Bairro:</strong> {endereco.bairro}<br/>
            <strong>Cidade:</strong> {endereco.cidade}<br/>
            <strong>CEP:</strong> {endereco.cep}<br/>
            {endereco.complemento && (
              <>
                <strong>Complemento:</strong> {endereco.complemento}<br/>
              </>
            )}
          </Text>
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Heading style={h2}>🛒 Compra</Heading>
          <Text style={text}>
            <strong>Modalidade:</strong> {modalidade}<br/>
            <strong>Tratamento:</strong> {tratamento.tipo || 'Não informado'}<br/>
            <strong>Preço:</strong> {tratamento.preco || 'Não informado'}
          </Text>
        </Section>

        {agendamento && (
          <>
            <Hr style={hr} />
            <Section style={section}>
              <Heading style={h2}>📅 Agendamento</Heading>
              <Text style={text}>
                <strong>Data:</strong> {agendamento.dia}<br/>
                <strong>Horário:</strong> {agendamento.horario}
              </Text>
            </Section>
          </>
        )}

        <Hr style={hr} />
        <Section style={section}>
          <Heading style={h2}>📊 Dados de Origem</Heading>
          <Text style={text}>
            {utmData?.utm_source ? (
              <>
                <strong>Fonte:</strong> {utmData.utm_source}<br/>
                {utmData.utm_medium && <><strong>Mídia:</strong> {utmData.utm_medium}<br/></>}
                {utmData.utm_campaign && <><strong>Campanha:</strong> {utmData.utm_campaign}<br/></>}
                {utmData.utm_content && <><strong>Conteúdo:</strong> {utmData.utm_content}<br/></>}
                {utmData.utm_term && <><strong>Termo:</strong> {utmData.utm_term}<br/></>}
                {utmData.fbclid && <><strong>Facebook Click ID:</strong> {utmData.fbclid}<br/></>}
              </>
            ) : (
              <>
                <strong>⚠️ Origem não identificada via UTMs</strong><br/>
                {utmData?.referrer && <><strong>Referrer:</strong> {utmData.referrer}<br/></>}
                {utmData?.user_agent && <><strong>User Agent:</strong> {utmData.user_agent.substring(0, 100)}...<br/></>}
                <strong>Status:</strong> <span style={{color: '#e74c3c'}}>UTMs não capturadas - verificar campanhas!</span><br/>
              </>
            )}
            {utmData?.session_id && <><strong>Sessão:</strong> {utmData.session_id}<br/></>}
          </Text>
        </Section>

      </Container>
    </Body>
  </Html>
)

export default FormNotificationEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  border: '1px solid #e6ebf1',
}

const h1 = {
  color: '#32325d',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 20px 20px',
  padding: '0',
}

const h2 = {
  color: '#32325d',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 10px',
  padding: '0',
}

const text = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const section = {
  margin: '0 20px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}