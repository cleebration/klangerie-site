/**
 * Zentrale Konfiguration der Website klangerie.at.
 * Abgeleitet von lko-site (gleiche Kits, gleicher Aufbau). Angelegt 14.10.2026 (Claude, Projekt „MyProj Klangerie“).
 */
export default {
  // Kanonischer Name ohne www. Der Worker führt www.klangerie.at dorthin.
  siteUrl: "https://klangerie.at",
  canonicalHost: "klangerie.at",

  fonts: { selfHost: true },

  locales: ["de", "en"],
  defaultLocale: "de",
  autoDetectLanguage: true,

  /* Kein eigener Hub: Termine und Neuigkeiten liegen in den cleebration-Hubs
     und tragen dort `sites: [klangerie]`. Solange es noch keinen Eintrag gibt,
     liefert der Hub für klangerie nichts (404) – die Module zeigen dann
     „Derzeit keine …“ (PATCH klangerie in den Widgets). */
  feeds: {
    events: "https://cleebration-events-hub.vercel.app/feed/sites/klangerie.{lang}.json",
    blog:   "https://cleebration-blog-hub.vercel.app/feed/sites/klangerie.{lang}.json"
  },

  images: {
    logo:      "/assets/img/klangerie-wortmarke-hell.svg",
    logoColor: "/assets/img/klangerie-wortmarke-dunkel.svg",
    og:        "/assets/img/og-klangerie.png"
  },

  // Postfach: klangerie.at als sekundäre Domain im Workspace cleebration.com
  // (Regel Tool Baukasten, „Mail für Projekt-Domains“). Noch einzurichten.
  mail: "hallo@klangerie.at"
};
