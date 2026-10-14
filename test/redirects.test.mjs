/**
 * Prüft den Worker von klangerie.at: Kurzadressen, www → ohne www,
 * Asset-Schicht und /api/subscribe.
 *
 *   npm test          (baut vorher, damit worker/redirects.generated.js stimmt)
 */
import { readFileSync } from "node:fs";
import assert from "node:assert";
import worker from "../worker/index.js";

let bestanden = 0;
const ok = (bedingung, text) => { assert.ok(bedingung, text); console.log("  ✓ " + text); bestanden++; };

const BASIS = "https://klangerie.at";
async function hole(pfad, host = BASIS, init) {
  const env = { ASSETS: { fetch: async () => new Response("ASSET", { status: 200 }) } };
  return worker.fetch(new Request(host + pfad, init), env, {});
}
const ziel = (res) => (res.headers.get("location") || "").replace(BASIS, "");

console.log("\nWeiterleitungen klangerie.at\n");

for (const [alt, neu] of [["/konzerte", "/termine"], ["/kontakt", "/booking"], ["/anfrage", "/booking"], ["/orchester", "/ensemble"]]) {
  const r = await hole(alt);
  ok(r.status === 301 && ziel(r) === neu, `${alt} → ${neu} (301)`);
}
ok(ziel(await hole("/post/irgendwas")) === "/blog", "/post/… → /blog");

{
  const r = await hole("/ensemble", "https://www.klangerie.at");
  ok(r.status === 301 && r.headers.get("location") === BASIS + "/ensemble", "www → ohne www (301)");
  const r2 = await hole("/konzerte", "https://www.klangerie.at");
  ok(r2.headers.get("location") === BASIS + "/termine", "www + Kurzadresse: EIN Sprung");
  for (const p of ["/", "/termine", "/ensemble", "/programm", "/blog", "/booking", "/newsletter", "/impressum", "/datenschutz"]) {
    const r3 = await hole(p);
    if (r3.status !== 200 || (await r3.text()) !== "ASSET") assert.fail(`${p} geht nicht an die Asset-Schicht`);
  }
  ok(true, "alle Seiten gehen an die Asset-Schicht");
  const r5 = await hole("/api/subscribe");
  ok(r5.status === 405, "/api/subscribe nimmt nur POST an");
  const r6 = await hole("/api/subscribe", BASIS, { method: "POST", body: JSON.stringify({ email: "a@b.at", consent: true }), headers: { "Content-Type": "application/json" } });
  ok(r6.status === 500, "/api/subscribe ohne Secrets → 500 statt stiller Erfolg");
}

{
  const roh = readFileSync(new URL("../public/_redirects", import.meta.url), "utf8");
  const zweihundert = roh.split("\n").filter((z) => !z.trim().startsWith("#") && /\s2\d\d\s*$/.test(z));
  ok(zweihundert.length === 0, "keine 200er-Umschreibungen in _redirects");
  const wr = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
  ok(/"run_worker_first":\s*true/.test(wr), "run_worker_first: true — der Worker entscheidet");
}

{
  // Gebaute Seiten: keine offenen {{Platzhalter}}, kein LKO-Rest, Marke im Kopf
  const seiten = ["index", "termine", "event", "ensemble", "programm", "blog", "post", "booking", "newsletter", "impressum", "datenschutz"];
  for (const s of seiten) {
    const html = readFileSync(new URL(`../public/${s}.html`, import.meta.url), "utf8");
    if (/\{\{\w+\}\}/.test(html)) assert.fail(`${s}.html: offener Platzhalter ${html.match(/\{\{\w+\}\}/)[0]}`);
    if (/kammerorchester|linzer-kammer/i.test(html)) assert.fail(`${s}.html: enthält noch LKO-Text`);
    if (!html.includes("klangerie-wortmarke-hell.svg")) assert.fail(`${s}.html: Wortmarke fehlt im Kopf`);
  }
  ok(true, `${seiten.length} Seiten ohne offene Platzhalter, ohne LKO-Reste, mit Wortmarke`);
  const start = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  ok(start.includes('class="welle"'), "Startseite hat die Klangwelle");
}

console.log(`\n${bestanden} Prüfungen bestanden\n`);
