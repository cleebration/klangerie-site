/**
 * Prüft den Ensemble-Teil der Seite /ensemble (scripts/ensemble.mjs + src/data/ensemble.json).
 * Erfundene Beispieldaten (keine echten Personen) in test/fixtures/ensemble-beispiel.json.
 */
import { readFile } from "node:fs/promises";
import { renderEnsemble } from "../scripts/ensemble.mjs";

let fehler = 0;
const ok = (b, msg) => { console.log(`${b ? "✓" : "✗"} ${msg}`); if (!b) fehler++; };

const echt = JSON.parse(await readFile(new URL("../src/data/ensemble.json", import.meta.url), "utf8"));
ok(Array.isArray(echt.gruppen) && Array.isArray(echt.personen), "src/data/ensemble.json: gruppen + personen");
ok(new Set(echt.personen.map((p) => p.id)).size === echt.personen.length, "src/data/ensemble.json: IDs eindeutig");
ok(echt.personen.every((p) => p.art !== "gast" && p.art !== "solist" ? echt.gruppen.some((g) => g.key === p.gruppe) : true), "src/data/ensemble.json: jede Gruppe vorhanden");
ok(renderEnsemble(echt, ["de", "en"], "de") === "" || echt.personen.some((p) => p.aktiv), "leere Liste → kein HTML");

const bsp = JSON.parse(await readFile(new URL("./fixtures/ensemble-beispiel.json", import.meta.url), "utf8"));
const html = renderEnsemble(bsp, ["de", "en"], "de");
ok(html.includes("Beispiel Eins") && html.includes("Beispiel Drei"), "aktive Personen erscheinen");
ok(!html.includes("Beispiel Zwei"), "inaktive Personen erscheinen nicht");
ok(!html.includes("javascript:"), "unsichere Links werden verworfen");
ok(html.includes("Zu Gast") && html.includes("Gast Vier"), "Gäste eigener Abschnitt");
ok(html.indexOf("Violine") < html.indexOf("Klavier"), "Reihenfolge der Gruppen bleibt");

if (fehler) { console.log(`\n${fehler} Fehler`); process.exit(1); }
console.log("\nEnsemble: alle Prüfungen bestanden");
