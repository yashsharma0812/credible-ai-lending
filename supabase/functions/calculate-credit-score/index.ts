import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user profile and loan history
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: loans } = await supabase
      .from('loans')
      .select('*')
      .eq('borrower_id', userId);

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .limit(10);

    // Prepare data for AI analysis
    const userData = {
      kycCompleted: profile?.kyc_status === 'completed',
      totalLoans: loans?.length || 0,
      activeLoans: loans?.filter(l => l.status === 'active').length || 0,
      completedLoans: loans?.filter(l => l.status === 'completed').length || 0,
      defaultedLoans: loans?.filter(l => l.status === 'defaulted').length || 0,
      transactionCount: transactions?.length || 0,
    };

    // Call Lovable AI for credit scoring
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a credit scoring AI. Analyze user financial behavior and return a JSON response with:
            1. score (0-1000)
            2. explanation (short 2-3 sentence explanation)
            3. factors (array of positive/negative factors)
            
            Consider: KYC completion, loan history, repayment patterns, transaction frequency.`
          },
          {
            role: 'user',
            content: `Analyze this user's creditworthiness: ${JSON.stringify(userData)}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "credit_score_result",
              description: "Return structured credit score analysis",
              parameters: {
                type: "object",
                properties: {
                  score: { 
                    type: "integer",
                    minimum: 0,
                    maximum: 1000,
                    description: "Credit score from 0-1000"
                  },
                  explanation: { 
                    type: "string",
                    description: "Brief 2-3 sentence explanation of the score"
                  },
                  factors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        factor: { type: "string" },
                        impact: { type: "string", enum: ["positive", "negative", "neutral"] }
                      }
                    }
                  }
                },
                required: ["score", "explanation", "factors"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "credit_score_result" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Store credit score in database
    const { data: creditScore, error: dbError } = await supabase
      .from('credit_scores')
      .insert({
        user_id: userId,
        score: result.score,
        explanation: result.explanation,
        factors: result.factors,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    return new Response(
      JSON.stringify(creditScore),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in calculate-credit-score:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
