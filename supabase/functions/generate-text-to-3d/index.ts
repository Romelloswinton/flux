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
    const { prompt, artStyle, negativePrompt, userId } = await req.json()

    if (!prompt || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Create AI job record in database
    const { data: job, error: jobError } = await supabase
      .from('ai_generation_jobs')
      .insert({
        owner_id: userId,
        job_type: 'text-to-3d',
        prompt,
        options: { artStyle, negativePrompt },
        status: 'pending',
      })
      .select()
      .single()

    if (jobError) {
      console.error('Database error:', jobError)
      return new Response(
        JSON.stringify({ error: jobError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call Meshy AI API
    const meshyApiKey = Deno.env.get('MESHY_API_KEY')
    if (!meshyApiKey) {
      throw new Error('MESHY_API_KEY environment variable not set')
    }

    const meshyResponse = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${meshyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'preview', // 'preview' for faster generation
        prompt,
        art_style: artStyle || 'realistic',
        negative_prompt: negativePrompt || '',
      }),
    })

    if (!meshyResponse.ok) {
      const errorText = await meshyResponse.text()
      console.error('Meshy API error:', errorText)

      // Update job status to failed
      await supabase
        .from('ai_generation_jobs')
        .update({
          status: 'failed',
          error_message: `Meshy API error: ${errorText}`,
        })
        .eq('id', job.id)

      return new Response(
        JSON.stringify({ error: `Meshy API error: ${errorText}` }),
        { status: meshyResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const meshyData = await meshyResponse.json()
    const externalJobId = meshyData.result

    // Update job with external ID and set to processing
    await supabase
      .from('ai_generation_jobs')
      .update({
        external_job_id: externalJobId,
        status: 'processing',
      })
      .eq('id', job.id)

    console.log('✅ AI generation job created:', job.id, 'Meshy task:', externalJobId)

    return new Response(
      JSON.stringify({
        jobId: job.id,
        externalJobId: externalJobId,
        message: 'Generation started successfully',
      }),
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
