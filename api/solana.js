// /api/solana.js  — Edge Function proxy for BSSC Solana RPC
export const config = { runtime: 'edge' };

const RPC_URL = process.env.BSSC_SOLANA_RPC || 'https://bssc-rpc.bssc.live';

// CORS aloud for browser apps
const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

export default async function handler(request) {
  try {
    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ jsonrpc: '2.0', error: { code: -32600, message: 'POST required' }, id: null }),
        { status: 405, headers: { 'content-type': 'application/json', ...corsHeaders } }
      );
    }

    // Read raw JSON-RPC body
    const raw = await request.text();

    // Forward to upstream validator
    const upstream = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: raw || '{}',
    });

    const text = await upstream.text();

    // Forward exact status + JSON body back to browser
    return new Response(text, {
      status: upstream.status,
      headers: { 'content-type': 'application/json', ...corsHeaders },
    });
  } catch (e) {
    const err = { jsonrpc: '2.0', error: { code: -32000, message: String(e) }, id: null };
    return new Response(JSON.stringify(err), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders },
    });
  }
}
