// Shared trip state for the planner. One JSON document in Netlify Blobs.
// Access requires the TRIP_CODE environment variable (sent as x-trip-code).
import { getStore } from "@netlify/blobs";

const LISTS = ["acts", "pl", "tr", "ex", "bk", "tasks"];
const J = (o, s = 200) =>
  new Response(JSON.stringify(o), {
    status: s,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export default async (req) => {
  const code = Netlify.env.get("TRIP_CODE");
  if (!code) return J({ error: "TRIP_CODE not set on the server" }, 500);
  if (req.headers.get("x-trip-code") !== code) return J({ error: "auth" }, 401);

  const store = getStore("trip");
  const doc = (await store.get("doc", { type: "json" })) || { rev: 0, lists: {}, tomb: {}, kv: {} };

  if (req.method === "GET") {
    const since = Number(new URL(req.url).searchParams.get("since"));
    return since === doc.rev ? J({ rev: doc.rev, same: true }) : J(doc);
  }
  if (req.method !== "POST") return J({ error: "method" }, 405);

  let inc;
  try { inc = await req.json(); } catch { return J({ error: "bad json" }, 400); }

  for (const k of LISTS) {
    const m = new Map((doc.lists[k] || []).map((x) => [x.id, x]));
    for (const x of (inc.lists && inc.lists[k]) || []) {
      if (!x || typeof x.id !== "string") continue;
      const o = m.get(x.id);
      if (!o || (x._u || 0) > (o._u || 0)) m.set(x.id, x);
    }
    doc.lists[k] = [...m.values()];
  }
  for (const [id, t] of Object.entries(inc.tomb || {}))
    if (t > (doc.tomb[id] || 0)) doc.tomb[id] = t;
  for (const k of LISTS)
    doc.lists[k] = doc.lists[k].filter((x) => !(doc.tomb[x.id] && doc.tomb[x.id] >= (x._u || 0)));
  for (const [k, e] of Object.entries(inc.kv || {}))
    if (e && (!doc.kv[k] || e.t > doc.kv[k].t)) doc.kv[k] = e;

  doc.rev += 1;
  await store.setJSON("doc", doc);
  return J(doc);
};

export const config = { path: "/api/state" };
