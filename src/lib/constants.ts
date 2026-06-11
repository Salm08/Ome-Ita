export const ITALIAN_REGIONS = [
  "Abruzzo",
  "Basilicata",
  "Calabria",
  "Campania",
  "Emilia-Romagna",
  "Friuli-Venezia Giulia",
  "Lazio",
  "Liguria",
  "Lombardia",
  "Marche",
  "Molise",
  "Piemonte",
  "Puglia",
  "Sardegna",
  "Sicilia",
  "Toscana",
  "Trentino-Alto Adige",
  "Umbria",
  "Valle d'Aosta",
  "Veneto",
] as const;

export const GENDER_LABELS: Record<string, string> = {
  MALE: "Uomo",
  FEMALE: "Donna",
  COUPLE: "Coppia",
};

export const REPORT_REASONS = [
  "Contenuto inappropriato",
  "Nudità",
  "Molestie",
  "Spam",
  "Minori",
  "Altro",
] as const;
