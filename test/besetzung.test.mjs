/** Prüft die Besetzung auf /ensemble (scripts/besetzung.mjs + src/data/besetzung.json). */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { renderBesetzung } from "../scripts/besetzung.mjs";

let fehler = 0;
const ok = (b, msg) => { console.log(`${b ? "✓" : "✗"} ${msg}`); if (!b) fehler++; };

const echt = JSON.parse(await readFile(new URL("../src/data/besetzung.json", import.meta.url), "utf8"));
ok(Array.isArray(echt.personen), "besetzung.json: personen");
ok(new Set(echt.personen.map((p) => p.id)).size === echt.personen.length, "besetzung.json: IDs eindeutig");
ok(echt.personen.every((p) => !p.foto || existsSync(new URL(`../public${p.foto}`, import.meta.url))), "besetzung.json: alle Fotos vorhanden");

const html = renderBesetzung({ personen: [
  { id: "b", name: "Beispiel Zwei", reihenfolge: 20, instrument: { de: "Klavier", en: "Piano" } },
  { id: "a", name: "Beispiel Eins", reihenfolge: 10, link: "javascript:alert(1)", text: "Kurz" },
  { id: "c", name: "Beispiel Aus", aktiv: false },
  { id: "d", name: "Beispiel Ohne Reihe" },
] }, ["de", "en"], "de");
ok(html.indexOf("Beispiel Eins") < html.indexOf("Beispiel Zwei") && html.indexOf("Beispiel Zwei") < html.indexOf("Beispiel Ohne Reihe"), "Reihenfolge, leer ans Ende");
ok(!html.includes("Beispiel Aus"), "aktiv=false erscheint nicht");
ok(!html.includes("javascript:"), "unsichere Links verworfen");
ok(!html.includes("<img"), "ohne Foto kein Bild");
ok(html.includes('data-lang="en">Piano'), "mehrsprachiges Instrument");
ok(renderBesetzung({ personen: [] }) === "", "leere Liste → kein HTML");

if (fehler) { console.log(`\n${fehler} Fehler`); process.exit(1); }
console.log("\nBesetzung: alle Prüfungen bestanden");
