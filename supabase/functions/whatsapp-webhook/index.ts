import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookMessage {
  from: string;
  text?: {
    body: string;
  };
  type: string;
  timestamp: string;
}

interface WebhookEntry {
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      messages?: WebhookMessage[];
    };
  }>;
}

interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('WhatsApp webhook called:', req.method);

    if (req.method === 'GET') {
      // Handle webhook verification from 360Dialog
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('Webhook verification:', { mode, token, challenge });

      if (mode === 'subscribe' && token === "automiza_webhook_token") {
        console.log('Webhook verification successful');
        return new Response(challenge, { 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        });
      }

      return new Response('Forbidden', { 
        status: 403, 
        headers: corsHeaders 
      });
    }

    if (req.method === 'POST') {
      const payload: WebhookPayload = await req.json();
      console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

      // Process each entry in the webhook
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          const messages = change.value.messages;
          const phoneNumberId = change.value.metadata.phone_number_id;

          console.log('Processing messages for phone:', phoneNumberId);

          if (messages) {
            for (const message of messages) {
              console.log('Processing message:', message);

              // Find the WhatsApp integration for this phone number
              const { data: integration, error: integrationError } = await supabase
                .from('whatsapp_integrations')
                .select('*')
                .eq('phone_number_id', phoneNumberId)
                .eq('is_active', true)
                .single();

              if (integrationError || !integration) {
                console.error('No active integration found for phone:', phoneNumberId, integrationError);
                continue;
              }

              console.log('Found integration for user:', integration.user_id);

              // Process the message based on type
              if (message.type === 'text' && message.text?.body) {
                const messageText = message.text.body;
                const fromNumber = message.from;

                console.log('Processing text message:', messageText, 'from:', fromNumber);

                // Find or create lead for this contact
                let { data: existingLead } = await supabase
                  .from('leads')
                  .select('*')
                  .eq('telefone', fromNumber)
                  .limit(1)
                  .single();

                if (!existingLead) {
                  // Create new lead
                  const { data: newLead, error: leadError } = await supabase
                    .from('leads')
                    .insert({
                      nome: `WhatsApp ${fromNumber}`,
                      telefone: fromNumber,
                      origem: 'WhatsApp',
                      status: 'novo',
                      pipeline_stage: 'novo',
                      negocio_id: null, // We'll need to improve this to find the right negocio
                      observacoes: `Primeira mensagem: ${messageText}`
                    })
                    .select()
                    .single();

                  if (leadError) {
                    console.error('Error creating lead:', leadError);
                  } else {
                    existingLead = newLead;
                    console.log('Created new lead:', existingLead?.id);
                  }
                }

                // Here we would process the message with chatbot AI
                // For now, we'll just log it
                console.log('Message processed for lead:', existingLead?.id);

                // TODO: Call chatbot AI function with the message
                // const response = await supabase.functions.invoke('chatbot-ai', {
                //   body: {
                //     message: messageText,
                //     leadId: existingLead?.id,
                //     userId: integration.user_id
                //   }
                // });
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Error in whatsapp-webhook function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});