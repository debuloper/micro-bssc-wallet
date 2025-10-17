// /api/solana.js — server-side JSON-RPC proxy for BSSC (Solana runtime)
export default async function handler(req, res) {
  const RPC_URL = process.env.BSSC_SOLANA_RPC || "https://bssc-rpc.bssc.live";
  try {
    const raw =
      typeof req.text === "function"
        ? await req.text()
        : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body || {});
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
