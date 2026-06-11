import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Ome Ita",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 prose prose-invert">
      <h1 className="text-3xl font-bold mb-6">Informativa sulla Privacy</h1>
      <p className="text-[var(--text-secondary)] mb-4">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</p>

      <section className="space-y-4 text-[var(--text-secondary)]">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">1. Titolare del Trattamento</h2>
        <p>
          Il titolare del trattamento dei dati personali è Ome Ita. Per qualsiasi richiesta relativa
          alla privacy, contattaci all&apos;indirizzo email: privacy@omeita.it
        </p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">2. Dati Raccolti</h2>
        <p>Raccogliamo le seguenti categorie di dati:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Dati di registrazione:</strong> email, password (criptata), sesso, età, regione, stato</li>
          <li><strong>Dati di utilizzo:</strong> log di connessione, indirizzo IP, tipo di browser</li>
          <li><strong>Dati della sessione:</strong> preferenze di genere e regione per utenti ospiti</li>
          <li><strong>Contenuti:</strong> messaggi di chat (non memorizzati permanentemente), flussi video peer-to-peer</li>
        </ul>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">3. Finalità del Trattamento</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Erogazione del servizio di videochat e chat testuale</li>
          <li>Matching tra utenti</li>
          <li>Moderazione e sicurezza della piattaforma</li>
          <li>Adempimento di obblighi legali</li>
        </ul>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">4. Base Giuridica (GDPR)</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Art. 6(1)(b):</strong> Esecuzione del contratto (fornitura del servizio)</li>
          <li><strong>Art. 6(1)(a):</strong> Consenso (cookie analitici, marketing)</li>
          <li><strong>Art. 6(1)(f):</strong> Legittimo interesse (sicurezza, prevenzione abusi)</li>
        </ul>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">5. Conservazione dei Dati</h2>
        <p>
          I dati dell&apos;account vengono conservati fino alla cancellazione dell&apos;account.
          I messaggi di chat non vengono memorizzati sui nostri server. I log di connessione
          vengono conservati per 90 giorni per finalità di sicurezza.
        </p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">6. Condivisione dei Dati</h2>
        <p>
          I flussi video sono peer-to-peer (WebRTC) e non transitano sui nostri server.
          Non vendiamo i tuoi dati a terze parti. Potremmo condividere dati con autorità
          competenti se richiesto per legge.
        </p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">7. I Tuoi Diritti</h2>
        <p>Ai sensi del GDPR (Regolamento UE 2016/679), hai diritto a:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Accesso ai tuoi dati personali</li>
          <li>Rettifica dei dati inesatti</li>
          <li>Cancellazione (&quot;diritto all&apos;oblio&quot;)</li>
          <li>Limitazione del trattamento</li>
          <li>Portabilità dei dati</li>
          <li>Opposizione al trattamento</li>
          <li>Revoca del consenso in qualsiasi momento</li>
        </ul>
        <p>Per esercitare i tuoi diritti, scrivi a privacy@omeita.it</p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">8. Sicurezza</h2>
        <p>
          Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati,
          inclusa la crittografia delle password (bcrypt), connessioni HTTPS e token JWT sicuri.
        </p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">9. Minori</h2>
        <p>
          Il servizio è riservato esclusivamente a persone di età pari o superiore a 18 anni.
          Non raccogliamo consapevolmente dati di minori.
        </p>
      </section>
    </div>
  );
}
