import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { action, leadIds, newStatus, message } = await req.json();

    console.log('Bulk action:', { action, leadIds: leadIds?.length, newStatus });

    if (!action || !leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      throw new Error('Invalid parameters: action and leadIds array required');
    }

    let result;

    switch (action) {
      case 'update_status':
        if (!newStatus) {
          throw new Error('newStatus is required for update_status action');
        }
        
        const { data: updateData, error: updateError } = await supabase
          .from('leads')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .in('id', leadIds)
          .select();

        if (updateError) throw updateError;
        
        result = {
          success: true,
          updated: updateData.length,
          action: 'status_updated',
          newStatus
        };
        break;

      case 'archive':
        const { data: archiveData, error: archiveError } = await supabase
          .from('leads')
          .update({ 
            status: 'perdido',
            updated_at: new Date().toISOString()
          })
          .in('id', leadIds)
          .select();

        if (archiveError) throw archiveError;
        
        result = {
          success: true,
          archived: archiveData.length,
          action: 'archived'
        };
        break;

      case 'send_followup':
        // Aqui você pode integrar com WhatsApp ou outro sistema de mensagens
        // Por enquanto, apenas marcamos como contatado
        const { data: followupData, error: followupError } = await supabase
          .from('leads')
          .update({ 
            status: 'contatado',
            updated_at: new Date().toISOString()
          })
          .in('id', leadIds)
          .select();

        if (followupError) throw followupError;

        // TODO: Integrar com sistema de mensagens (WhatsApp, Email, etc)
        console.log('Follow-up would be sent to:', leadIds.length, 'leads');
        
        result = {
          success: true,
          contacted: followupData.length,
          action: 'followup_sent',
          message: message || 'Follow-up automático'
        };
        break;

      case 'delete':
        const { data: deleteData, error: deleteError } = await supabase
          .from('leads')
          .delete()
          .in('id', leadIds)
          .select();

        if (deleteError) throw deleteError;
        
        result = {
          success: true,
          deleted: deleteData.length,
          action: 'deleted'
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log('Bulk action result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bulk-lead-actions:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
