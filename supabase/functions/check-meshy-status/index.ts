import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { externalJobId, jobId } = await req.json()

    if (!externalJobId) {
      return new Response(
        JSON.stringify({ error: 'Missing externalJobId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const meshyApiKey = Deno.env.get('MESHY_API_KEY')
    if (!meshyApiKey) {
      throw new Error('MESHY_API_KEY environment variable not set')
    }

    // Check Meshy task status
    const meshyResponse = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${externalJobId}`, {
      headers: {
        'Authorization': `Bearer ${meshyApiKey}`,
      },
    })

    if (!meshyResponse.ok) {
      const errorText = await meshyResponse.text()
      console.error('Meshy API error:', errorText)
      return new Response(
        JSON.stringify({ error: `Meshy API error: ${errorText}` }),
        { status: meshyResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const meshyData = await meshyResponse.json()

    // Update database if jobId provided
    if (jobId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      const updates: any = {
        external_status: meshyData.status,
      }

      // If completed successfully
      if (meshyData.status === 'SUCCEEDED') {
        updates.status = 'succeeded'
        updates.result_url = meshyData.model_urls?.glb
        updates.thumbnail_url = meshyData.thumbnail_url
        updates.completed_at = new Date().toISOString()
        updates.processing_time_seconds = meshyData.finished_at
          ? Math.floor((meshyData.finished_at - meshyData.created_at) / 1000)
          : null
      } else if (meshyData.status === 'FAILED' || meshyData.status === 'EXPIRED') {
        updates.status = 'failed'
        updates.error_message = meshyData.error?.message || 'Generation failed'
        updates.completed_at = new Date().toISOString()
      } else if (meshyData.status === 'IN_PROGRESS') {
        updates.status = 'processing'
      }

      await supabase
        .from('ai_generation_jobs')
        .update(updates)
        .eq('id', jobId)
    }

    return new Response(
      JSON.stringify(meshyData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
