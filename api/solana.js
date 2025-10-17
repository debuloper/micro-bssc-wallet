// /api/solana.js — server-side proxy for Solana JSON-RPC (BSSC)
export default async function handler(req, res) {
  const RPC_URL = process.env.BSSC_SOLANA_RPC || "https://bssc-rpc.bssc.live"; 
  try {
    // Vercel Edge/Node どちらでも動くように body を取り出す
    const raw = (req.body && typeof req.body === "string")
      ? req.body
      : (typeof req.text === "function" ? await req.text() : JSON.stringify(req.body));

    const r = await fetch(RPC_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: raw
    });

    const text = await r.text();
    res.setHeader("content-type", "application/json");
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: String(e) },
      id: null
    });
  }
}
