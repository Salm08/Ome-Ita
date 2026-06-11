import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - Ome Ita",
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      <p className="text-[var(--text-secondary)] mb-4">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</p>

      <section className="space-y-4 text-[var(--text-secondary)]">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Cosa sono i Cookie</h2>
        <p>
          I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web.
          Vengono utilizzati per far funzionare il sito e per migliorare la tua esperienza.
        </p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Cookie che Utilizziamo</h2>

        <div className="glass rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-[var(--text-primary)]">Cookie Tecnici (necessari)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2">Nome</th>
                <th className="text-left py-2">Scopo</th>
                <th className="text-left py-2">Durata</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2">auth_token</td>
                <td className="py-2">Autenticazione utente</td>
                <td className="py-2">7 giorni</td>
              </tr>
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2">cookie_consent</td>
                <td className="py-2">Memorizza le preferenze sui cookie</td>
                <td className="py-2">1 anno</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="glass rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-[var(--text-primary)]">Cookie Analitici (con consenso)</h3>
          <p>
            Utilizziamo cookie analitici solo se accetti &quot;Accetta tutti&quot; nel banner cookie.
            Questi ci aiutano a capire come viene utilizzato il sito per migliorarlo.
          </p>
        </div>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Come Gestire i Cookie</h2>
        <p>
          Puoi gestire le tue preferenze sui cookie tramite il banner che appare alla prima visita,
          oppure modificando le impostazioni del tuo browser. La disabilitazione dei cookie tecnici
          potrebbe compromettere il funzionamento del sito.
        </p>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Normativa di Riferimento</h2>
        <p>
          Questa policy è conforme al Regolamento UE 2016/679 (GDPR), al D.Lgs. 196/2003 (Codice Privacy italiano)
          e alle Linee Guida del Garante per la Protezione dei Dati Personali sui cookie (Provvedimento n. 231 del 10 giugno 2021).
        </p>
      </section>
    </div>
  );
}
