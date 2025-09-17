import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

interface SendMessageRequest {
  to: string;
  message: string;
  userId: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { to, message, userId }: SendMessageRequest = await req.json();
    console.log('Sending WhatsApp message:', { to, message, userId });

    // Get the centralized API credentials
    // In the centralized model, we use a single set of credentials
    const API_KEY = Deno.env.get('DIALOG360_API_KEY');
    const PHONE_NUMBER_ID = Deno.env.get('DIALOG360_PHONE_NUMBER_ID');

    if (!API_KEY || !PHONE_NUMBER_ID) {
      console.error('Missing centralized 360Dialog credentials');
      return new Response(JSON.stringify({ 
        error: 'Centralized WhatsApp credentials not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user has an active integration for this number
    const { data: integration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (integrationError) {
      console.error('Error checking user integration:', integrationError);
      return new Response(JSON.stringify({ 
        error: 'Error verifying user integration' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!integration) {
      console.error('No active WhatsApp integration found for user:', userId);
      return new Response(JSON.stringify({ 
        error: 'No active WhatsApp integration found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send message via 360Dialog API using centralized credentials
    const response = await fetch(`https://waba.360dialog.io/v1/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: to,
        type: 'text',
        text: {
          body: message
        }
      }),
    });

    const responseData = await response.json();
    console.log('360Dialog API response:', responseData);

    if (!response.ok) {
      console.error('360Dialog API error:', responseData);
      return new Response(JSON.stringify({ 
        error: 'Failed to send message via 360Dialog',
        details: responseData 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: responseData.messages?.[0]?.id,
      to: to,
      message: message
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