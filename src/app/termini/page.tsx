import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termini di Servizio - Ome Ita",
};

export default function TerminiPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Termini di Servizio</h1>
      <p className="text-[var(--text-secondary)] mb-4">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</p>

      <section className="space-y-4 text-[var(--text-secondary)]">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">1. Accettazione dei Termini</h2>
        <p>
          Utilizzando Ome Ita, accetti questi Termini di Servizio. Se non sei d&apos;accordo, non utilizzare il servizio.
        </p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">2. Requisiti di Età</h2>
        <p>
          Il servizio è riservato esclusivamente a persone di età pari o superiore a 18 anni.
          Registrandoti dichiari di avere almeno 18 anni.
        </p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">3. Uso Consentito</h2>
        <p>È vietato:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Mostrare contenuti illegali, offensivi o sessualmente espliciti non consensuali</li>
          <li>Molestare, minacciare o discriminare altri utenti</li>
          <li>Registrare o distribuire conversazioni senza consenso</li>
          <li>Utilizzare bot o automazioni</li>
          <li>Impersonare altre persone</li>
          <li>Utilizzare il servizio per attività commerciali non autorizzate</li>
        </ul>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">4. Moderazione</h2>
        <p>
          Ci riserviamo il diritto di sospendere o bannare account che violano questi termini.
          Gli utenti possono segnalare comportamenti inappropriati tramite il sistema di segnalazione.
        </p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">5. Limitazione di Responsabilità</h2>
        <p>
          Ome Ita è fornito &quot;così com&apos;è&quot;. Non siamo responsabili per il comportamento
          degli altri utenti. Le interazioni avvengono tra utenti e ogni utente è responsabile
          delle proprie azioni.
        </p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">6. Proprietà Intellettuale</h2>
        <p>
          Tutti i contenuti del sito (design, logo, codice) sono di proprietà di Ome Ita
          e protetti dalle leggi sul diritto d&apos;autore.
        </p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">7. Modifiche</h2>
        <p>
          Ci riserviamo il diritto di modificare questi termini in qualsiasi momento.
          Le modifiche saranno pubblicate su questa pagina.
        </p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">8. Legge Applicabile</h2>
        <p>
          Questi termini sono regolati dalla legge italiana. Per qualsiasi controversia
          è competente il foro del consumatore.
        </p>
      </section>
    </div>
  );
}
