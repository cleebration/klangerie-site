# klangerie-site — klangerie.at

Website des Kammermusik-Ensembles **Klangerie**, gebaut wie lko-site / babowalls.com / cleebration.com:
ein kleines Node-Skript setzt die Seiten aus Bausteinen zusammen, Termine und Neuigkeiten kommen
zur Laufzeit aus **zwei Feeds der cleebration-Hubs** (`sites: [klangerie]`).
Angelegt 14.10.2026 (Claude, Projekt „MyProj Klangerie“). Marke: Phase 1 Logo-System (Juli 2026),
Logo-Dateien in `1! claude/04 Templates/Branding/Klangerie`.

| Adresse | Inhalt | Quelle |
|---|---|---|
| `/` | Hero (Wortmarke, Klangwelle, Claim), nächster Auftritt*, Wer wir sind, Termine, Neuigkeiten, Booking + Newsletter | Events- + Blog-Hub |
| `/termine` · `/event?event=<slug>` | kommende + vergangene Auftritte | Events-Hub |
| `/ensemble` | Text + Besetzung + Personen aus `src/data/ensemble.json` | Redaktion → Werkzeuge → Ensemble |
| `/programm` | Was wir spielen (3 Karten) + Format | hier |
| `/blog` · `/post?post=<slug>` | Neuigkeiten | Blog-Hub |
| `/booking` | vorbereitete E-Mail an Veranstalter-Adresse | hier |
| `/newsletter` | Anmeldung → `/api/subscribe` → EmailOctopus | Worker |
| `/impressum` · `/datenschutz` | Medieninhaber Chris H. Leeb (Entscheidung 14.10.2026) | hier |

\* Der Kasten „Nächster Auftritt“ erscheint nur, wenn es einen kommenden Termin gibt.
Solange der Hub für `klangerie` noch nichts hat (404), zeigen die Module „Derzeit keine …“ (PATCH klangerie).

## Einmalig

```bash
npm install
npm test
npx wrangler deploy                         # → klangerie-site.<konto>.workers.dev
npx wrangler secret put EMAILOCTOPUS_API_KEY   # erst wenn Newsletter-Konto steht
npx wrangler secret put EMAILOCTOPUS_LIST_ID
```

Domain: klangerie.at liegt bei GoDaddy (Parkseite). Zone in Cloudflare anlegen, Nameserver bei GoDaddy
umstellen, dann `routes` in `wrangler.jsonc` einkommentieren und `npm run deploy`.

## Befehle

```bash
npm test             # baut und prüft Weiterleitungen, Seiten, Module, Ensemble
npm run preflight    # vor dem Livegang: Feeds erreichbar? Bilder da?
npm run deploy       # baut und lädt zu Cloudflare
```

## Schriften & Logo

* `public/assets/fonts/` – Fraunces + Hanken Grotesk (variabel, OFL, @fontsource-variable 5.3.0), vom eigenen Server.
* `public/assets/img/` – Wortmarke hell/dunkel, Lockup, Klangwelle, Siegel, Favicons, OG-Bild.
  Erzeugt aus den Original-Pfaden des YouTube-Banners (`_make_logos.py` im Drive-Projektordner, Output/_Werkzeug).
* Klangwelle als Trenner: `{{WELLE}}` in build.mjs (Herzschlag als SVG, Linien per CSS).

## Ensemble (`/ensemble`)

Personen stehen in `src/data/ensemble.json` (gruppen: vl, klar, vc, kb, pno, perc) und werden in der Redaktion
gepflegt (Werkzeuge → Ensemble). Nur `aktiv: true` erscheint. Nie löschen, nur ausschalten.
Ein Push auf `src/data/` deployt automatisch (`.github/workflows/ensemble.yml`, Secrets CLOUDFLARE_API_TOKEN/ACCOUNT_ID).
