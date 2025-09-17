import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Webhook received:', req.method, req.url);
    
    if (req.method === 'GET') {
      // Handle webhook verification
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('Webhook verification:', { mode, token, challenge });

      // Verify the token (você pode definir um token específico)
      const VERIFY_TOKEN = "automiza_webhook_token";
      
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully');
        return new Response(challenge, { status: 200 });
      } else {
        console.log('Webhook verification failed');
        return new Response('Forbidden', { status: 403 });
      }
    }

    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Webhook payload:', JSON.stringify(body, null, 2));

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Process incoming messages
      if (body.entry && body.entry[0] && body.entry[0].changes) {
        for (const change of body.entry[0].changes) {
          if (change.field === 'messages' && change.value.messages) {
            for (const message of change.value.messages) {
              console.log('Processing message:', message);
              
              const fromNumber = message.from;
              const messageText = message.text?.body || '';
              const messageId = message.id;
              
              // Find the integration based on the phone number
              const { data: integration, error: integrationError } = await supabase
                .from('whatsapp_integrations')
                .select('*')
                .eq('numero_whatsapp', fromNumber) // Note: pode precisar ajustar a lógica de matching
                .eq('is_active', true)
                .maybeSingle();

              if (integrationError) {
                console.error('Error finding integration:', integrationError);
                continue;
              }

              if (!integration) {
                console.log('No active integration found for number:', fromNumber);
                continue;
              }

              console.log('Found integration for user:', integration.user_id);

              // Here you can add logic to:
              // 1. Find the associated business/chatbot for this user
              // 2. Process the message through your AI chatbot
              // 3. Send automated responses
              // 4. Store conversation history
              // 5. Trigger automations

              // Example: Find related business and chatbot
              const { data: negocios, error: negociosError } = await supabase
                .from('negocios')
                .select('id, nome')
                .eq('user_id', integration.user_id)
                .limit(1);

              if (!negociosError && negocios && negocios.length > 0) {
                const negocio = negocios[0];
                
                // Find associated chatbot
                const { data: chatbot, error: chatbotError } = await supabase
                  .from('chatbots')
                  .select('*')
                  .eq('negocio_id', negocio.id)
                  .eq('ativo', true)
                  .maybeSingle();

                if (!chatbotError && chatbot) {
                  console.log('Found active chatbot:', chatbot.nome);
                  
                  // Here you would call your AI service to generate a response
                  // For now, we'll just log the interaction
                  
                  // Example: Call the chatbot-ai function to generate a response
                  try {
                    const { data: aiResponse, error: aiError } = await supabase.functions.invoke('chatbot-ai', {
                      body: {
                        message: messageText,
                        chatbot: chatbot,
                        negocio: negocio,
                        fromNumber: fromNumber
                      }
                    });

                    if (!aiError && aiResponse) {
                      console.log('AI response generated:', aiResponse);
                      
                      // Send the response back via WhatsApp
                      const { data: sendResult, error: sendError } = await supabase.functions.invoke('whatsapp-send', {
                        body: {
                          to: fromNumber,
                          message: aiResponse.response,
                          userId: integration.user_id
                        }
                      });

                      if (sendError) {
                        console.error('Error sending response:', sendError);
                      } else {
                        console.log('Response sent successfully:', sendResult);
                      }
                    }
                  } catch (aiError) {
                    console.error('Error calling AI function:', aiError);
                  }
                }
              }
            }
          }
        }
      }

      return new Response('OK', { 
        status: 200,
        headers: corsHeaders 
      });
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});