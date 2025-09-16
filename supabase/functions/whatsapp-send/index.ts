import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendMessageRequest {
  to: string;
  message: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, message, userId }: SendMessageRequest = await req.json();

    console.log('Sending WhatsApp message:', { to, message, userId });

    // Get user's WhatsApp integration
    const { data: integration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      console.error('No active WhatsApp integration found for user:', userId);
      return new Response(JSON.stringify({ 
        error: 'No active WhatsApp integration found' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare WhatsApp API request
    const whatsappApiUrl = `https://waba.360dialog.io/v1/messages`;
    const payload = {
      to: to,
      type: 'text',
      text: {
        body: message
      }
    };

    console.log('Sending to 360Dialog API:', payload);

    // Send message via 360Dialog API
    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': integration.api_key
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();
    console.log('360Dialog API response:', responseData);

    if (!response.ok) {
      console.error('Failed to send message:', responseData);
      return new Response(JSON.stringify({ 
        error: 'Failed to send message',
        details: responseData 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      messageId: responseData.messages?.[0]?.id,
      response: responseData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in whatsapp-send function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});