/**
 * besetzung.mjs – erzeugt die Personen auf /ensemble aus src/data/besetzung.json.
 *
 * Gepflegt in der Redaktion (Werkzeug „Besetzung“, wie theaterundmusik.at): je Person
 * Name · Instrument · Foto · Link · Text. Nur der Name ist Pflicht, Leeres erscheint nicht.
 * Gezeigt werden Personen mit aktiv !== false, sortiert nach `reihenfolge` (leer = ans Ende), dann Name.
 *
 * Fotos kommen in Farbe aus der Redaktion; die Website färbt sie mit dem SVG-Filter #klangerie-braun
 * in die Markenfarben (Dunkelbraun → Messing → Papier). So passt jedes neue Foto ohne Nacharbeit.
 */
import { esc, sichereUrl, mehrsprachig } from "./ensemble.mjs";

const hat = (w) =>
  w != null && (typeof w === "string" ? w.trim() !== "" : Object.values(w).some((v) => String(v ?? "").trim()));

const rang = (p) => (p.reihenfolge === "" || p.reihenfolge == null || isNaN(Number(p.reihenfolge)) ? 1e9 : Number(p.reihenfolge));

/* Duoton in Markenfarben: #24180F → #7A5232 → Messing #B68D40 → Papier #F3ECDD */
export const BRAUN_FILTER =
  '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><filter id="klangerie-braun" color-interpolation-filters="sRGB">' +
  '<feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"/>' +
  '<feComponentTransfer><feFuncR type="table" tableValues="0.141 0.478 0.714 0.953"/>' +
  '<feFuncG type="table" tableValues="0.094 0.322 0.553 0.925"/>' +
  '<feFuncB type="table" tableValues="0.059 0.196 0.251 0.867"/></feComponentTransfer></filter></svg>';

export function renderBesetzung(data, locales = ["de"], defaultLocale = locales[0]) {
  const L = [locales, defaultLocale];
  const leute = (data?.personen || [])
    .filter((p) => p && p.aktiv !== false && String(p.name || "").trim())
    .sort((a, b) => rang(a) - rang(b) || String(a.name).localeCompare(String(b.name), "de"));
  if (!leute.length) return "";
  const karten = leute.map((p) => {
    const link = sichereUrl(p.link);
    const auf = (inner) => (link ? `<a href="${esc(link)}" target="_blank" rel="noopener">${inner}</a>` : inner);
    const src = sichereUrl(p.foto);
    const foto = src ? auf(`<img class="person__bild" src="${esc(src)}" alt="${esc(p.name)}" loading="lazy" width="480" height="640" />`) : "";
    const inst = hat(p.instrument) ? `<p class="person__instrument">${mehrsprachig(p.instrument, ...L)}</p>` : "";
    const text = hat(p.text) ? `<p class="person__text">${mehrsprachig(p.text, ...L)}</p>` : "";
    return `<li class="person">${foto}<h3 class="person__name">${auf(esc(p.name))}</h3>${inst}${text}</li>`;
  });
  return `${BRAUN_FILTER}<ul class="personen" aria-label="Besetzung">${karten.join("")}</ul>`;
}
