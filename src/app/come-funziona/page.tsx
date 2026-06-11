import type { Metadata } from "next";
import Link from "next/link";
import { Video, MessageCircle, SkipForward, Flag, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Come funziona - Ome Ita",
  description: "Scopri come usare Ome Ita per videochat e chat testuale random con persone in Italia.",
};

export default function ComeFunzionaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Come funziona Ome Ita</h1>
        <p className="text-[var(--text-secondary)]">
          Incontra persone a caso in tutta Italia in pochi secondi
        </p>
      </div>

      <div className="space-y-6">
        {[
          {
            step: "1",
            title: "Scegli la modalità",
            desc: "Dalla home seleziona Video Chat per vederti e sentirti, oppure Solo Testo per chattare solo con messaggi.",
            icon: Video,
          },
          {
            step: "2",
            title: "Imposta le preferenze",
            desc: "Indica il tuo sesso, regione e stato. Puoi anche attivare la preferenza per match dalla tua regione.",
            icon: MessageCircle,
          },
          {
            step: "3",
            title: "Attendi il match",
            desc: "Il sistema ti abbina random con un altro utente online. Vedrai regione, stato e (se registrato) età del partner.",
            icon: SkipForward,
          },
          {
            step: "4",
            title: "Chatta e interagisci",
            desc: "In video mode puoi parlare, scrivere nella chat sotto il video e passare al prossimo utente con un click.",
            icon: MessageCircle,
          },
          {
            step: "5",
            title: "Segnala comportamenti scorretti",
            desc: "Se qualcuno si comporta in modo inappropriato, usa il pulsante Segnala. I moderatori provvederanno.",
            icon: Flag,
          },
          {
            step: "6",
            title: "Resta al sicuro",
            desc: "Non condividere dati personali. Il servizio è riservato a maggiorenni. Leggi la nostra Privacy Policy.",
            icon: Shield,
          },
        ].map((item) => (
          <div key={item.step} className="glass rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center font-bold shrink-0">
              {item.step}
            </div>
            <div>
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <item.icon className="w-5 h-5 text-[var(--accent)]" />
                {item.title}
              </h2>
              <p className="text-[var(--text-secondary)] text-sm mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/" className="btn-primary inline-block">
          Inizia ora
        </Link>
      </div>
    </div>
  );
}
