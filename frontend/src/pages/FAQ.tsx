import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { theme } from '../styles/theme';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface FAQProps {
  onBack?: () => void;
}

function FAQ({ onBack }: FAQProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tutte');

  const faqData: FAQItem[] = [
    // Generale
    {
      id: 1,
      category: 'Generale',
      question: 'Cosè Lume Finance e a cosa serve?',
      answer: 'Lume Finance è un\'app di gestione finanze personali che ti aiuta a tracciare entrate, uscite, budget e obiettivi di risparmio. La funzionalità unica è la scomposizione automatica dei costi nascosti per veicoli ed elettrodomestici (carburante, manutenzione, ammortamento, energia).'
    },
    {
      id: 2,
      category: 'Generale',
      question: 'I miei dati sono al sicuro?',
      answer: 'Sì! Tutti i dati sono salvati localmente sul tuo dispositivo in un database SQLite. Nessun dato viene inviato a server esterni. Sei tu l\'unico proprietario delle tue informazioni finanziarie.'
    },
    {
      id: 3,
      category: 'Generale',
      question: 'Posso usare Lume Finance su più dispositivi?',
      answer: 'Attualmente l\'app salva i dati solo localmente. Il sync cloud multi-dispositivo è in roadmap per le prossime versioni. Nel frattempo puoi usare la funzione Export/Import per trasferire i dati manualmente.'
    },

    // Movimenti
    {
      id: 4,
      category: 'Movimenti',
      question: 'Come aggiungo un movimento?',
      answer: 'Vai su Movimenti > Pulsante "+Nuovo" in alto a destra. Compila i campi: data, importo, tipo (entrata/uscita), categoria, conto e descrizione. Puoi anche collegare il movimento a un budget o obiettivo specifico.'
    },
    {
      id: 5,
      category: 'Movimenti',
      question: 'Cosa sono i movimenti ricorrenti?',
      answer: 'Sono movimenti che si ripetono automaticamente (es. stipendio mensile, affitto, abbonamenti). Vai su Movimenti > Tab "Ricorrenze" per gestirli. Imposta la frequenza (settimanale, mensile, annuale) e l\'app creerà automaticamente i movimenti.'
    },
    {
      id: 6,
      category: 'Movimenti',
      question: 'Posso modificare o eliminare un movimento?',
      answer: 'Sì! Clicca sul movimento nella lista, poi usa i pulsanti "Modifica" (icona matita) o "Elimina" (icona cestino). L\'eliminazione richiede conferma per evitare cancellazioni accidentali.'
    },

    // Scomposizione Costi
    {
      id: 7,
      category: 'Scomposizione Costi',
      question: 'Cosè la scomposizione dei costi nascosti?',
      answer: 'Quando usi l\'auto o un elettrodomestico, non paghi solo carburante o energia, ma anche manutenzione e ammortamento. L\'app calcola TUTTI i costi reali: per l\'auto (carburante + manutenzione + ammortamento km), per elettrodomestici (energia + ammortamento ore utilizzo).'
    },
    {
      id: 8,
      category: 'Scomposizione Costi',
      question: 'Come configuro un veicolo per la scomposizione?',
      answer: 'Vai su Patrimonio > Tab "Beni" > "+Nuovo Bene" > Seleziona "Veicolo". Inserisci: nome, tipo carburante, consumo medio (L/100km), costo manutenzione per km, prezzo acquisto e durata stimata. L\'app userà questi dati per calcolare i costi reali di ogni viaggio.'
    },
    {
      id: 9,
      category: 'Scomposizione Costi',
      question: 'Esempio pratico: quanto mi costa davvero un viaggio in auto?',
      answer: 'Esempio: viaggio di 200km con Fiat 500 (consumo 6.5L/100km, benzina 1.85€/L, manutenzione 0.06€/km). Costi: Carburante 24€ + Manutenzione 12€ + Ammortamento 8€ = TOTALE 44€ (non solo i 24€ della benzina!). L\'app mostra questa scomposizione automaticamente.'
    },

    // Budget
    {
      id: 10,
      category: 'Budget',
      question: 'Come funzionano i budget?',
      answer: 'Vai su Finanza > Tab "Budget" > "+Nuovo Budget". Scegli una categoria (es. Alimentari), importo limite (es. 300€) e periodo (settimanale/mensile/annuale). L\'app traccia le tue spese e ti mostra una barra di progresso con colori: verde (ok), giallo (attenzione 80%), rosso (superato).'
    },
    {
      id: 11,
      category: 'Budget',
      question: 'Posso avere più budget per la stessa categoria?',
      answer: 'No, un budget è legato a una categoria. Però puoi creare un budget "Emergenze" e collegare manualmente spese di QUALSIASI categoria usando il campo "budget_id" nel movimento. Questo è utile per budget trasversali.'
    },
    {
      id: 12,
      category: 'Budget',
      question: 'Cosa succede se supero un budget?',
      answer: 'La barra diventa rossa e mostra la percentuale di superamento (es. 105%). Non ci sono blocchi: l\'app ti avvisa ma non ti impedisce di spendere. È uno strumento di consapevolezza, non un limite rigido.'
    },

    // Obiettivi
    {
      id: 13,
      category: 'Obiettivi',
      question: 'Come creo un obiettivo di risparmio?',
      answer: 'Vai su Finanza > Tab "Obiettivi" > "+Nuovo Obiettivo". Inserisci: nome (es. "Vacanza Estate"), importo target (es. 2000€), data scadenza e priorità. Poi alloca fondi creando movimenti in ENTRATA con campo "obiettivo_id" collegato.'
    },
    {
      id: 14,
      category: 'Obiettivi',
      question: 'Come alloco denaro a un obiettivo?',
      answer: 'NON usare i vecchi pulsanti "Aggiungi/Rimuovi" (deprecati). Vai su Movimenti > "+Nuovo" > Tipo: "Entrata" > Seleziona Obiettivo dal dropdown > Inserisci importo. Esempio: "Allocazione risparmio vacanza - 100€". L\'obiettivo si aggiornerà automaticamente.'
    },
    {
      id: 15,
      category: 'Obiettivi',
      question: 'Posso modificare un obiettivo già avviato?',
      answer: 'Sì! Clicca sull\'obiettivo > "Modifica". Puoi cambiare nome, target, data scadenza e priorità. L\'importo accumulato viene ricalcolato automaticamente dalla somma dei movimenti collegati.'
    },

    // Conti e Patrimonio
    {
      id: 16,
      category: 'Patrimonio',
      question: 'Quanti conti posso creare?',
      answer: 'Illimitati! Puoi creare conti per carte di credito, conti correnti, contanti, risparmi, investimenti. Ogni movimento deve essere collegato a un conto. Il saldo si aggiorna automaticamente in base ai movimenti.'
    },
    {
      id: 17,
      category: 'Patrimonio',
      question: 'Come faccio un trasferimento tra conti?',
      answer: 'Vai su Patrimonio > Tab "Conti" > Pulsante "Trasferimento". Seleziona conto origine, conto destinazione e importo. L\'app crea automaticamente due movimenti collegati (uscita dal primo, entrata nel secondo).'
    },
    {
      id: 18,
      category: 'Patrimonio',
      question: 'Cosè un "Bene" e perché dovrei aggiungerlo?',
      answer: 'Un bene è un veicolo o elettrodomestico che genera costi nel tempo. Aggiungendolo, puoi usare la scomposizione automatica dei costi. Esempio: aggiungi la tua auto, poi ogni volta che fai rifornimento puoi vedere carburante + manutenzione + ammortamento.'
    },

    // Categorie
    {
      id: 19,
      category: 'Categorie',
      question: 'Posso creare categorie personalizzate?',
      answer: 'Sì! Vai su Movimenti > Tab "Categorie" > "+Nuova Categoria". Inserisci nome, tipo (entrata/uscita), scegli un\'icona emoji e un colore. Le categorie personalizzate appariranno nei dropdown quando crei movimenti o budget.'
    },
    {
      id: 20,
      category: 'Categorie',
      question: 'Posso modificare o eliminare una categoria?',
      answer: 'Sì, ma ATTENZIONE: eliminare una categoria rimuove il collegamento dai movimenti esistenti (rimangono senza categoria). Meglio disattivarla o rinominarla. Per modificare: Movimenti > Categorie > Click sulla categoria > "Modifica".'
    },

    // Dati e Export
    {
      id: 21,
      category: 'Dati',
      question: 'Come esporto i miei dati?',
      answer: 'Vai su Altro > "Esporta CSV". Il file contiene tutti i movimenti con dettagli completi (data, importo, categoria, conto, descrizione). Puoi aprirlo con Excel, Google Sheets o importarlo in altre app.'
    },
    {
      id: 22,
      category: 'Dati',
      question: 'Posso fare un backup del database?',
      answer: 'Sì! Il database si trova in data/lume.db. Copia questo file in un luogo sicuro (cloud, USB). Per ripristinare, sostituisci il file lume.db con il backup. CONSIGLIO: fai backup regolari prima di aggiornare l\'app.'
    },
    {
      id: 23,
      category: 'Dati',
      question: 'Cosa succede se resetto il database?',
      answer: '⚠️ ATTENZIONE: Reset Database elimina TUTTI i dati PERMANENTEMENTE (movimenti, conti, budget, obiettivi, beni, categorie). Non cè recupero. Usa solo se vuoi ricominciare da zero. FAI BACKUP PRIMA!'
    },

    // Tema e UI
    {
      id: 24,
      category: 'Interfaccia',
      question: 'Come cambio tra tema chiaro e scuro?',
      answer: 'Vai su Altro > Clicca su "Tema" > Pulsante "Cambia". Oppure clicca l\'icona sole/luna nell\'header in alto a destra. La preferenza viene salvata e mantenuta tra le sessioni.'
    },
    {
      id: 25,
      category: 'Interfaccia',
      question: 'Posso cambiare la valuta da Euro?',
      answer: 'Attualmente l\'app è ottimizzata per Euro (€). Il supporto multi-valuta con conversione automatica è pianificato per versioni future. Per ora puoi creare conti con valute diverse ma senza conversione automatica.'
    },

    // Troubleshooting
    {
      id: 26,
      category: 'Problemi',
      question: 'L\'app non si avvia o dà errore',
      answer: 'Verifica: 1) Backend in esecuzione (http://localhost:8000/docs dovrebbe aprirsi), 2) Frontend in esecuzione (npm run dev), 3) Database inizializzato correttamente, 4) Controlla console browser (F12) per errori JavaScript.'
    },
    {
      id: 27,
      category: 'Problemi',
      question: 'I dati non si salvano o scompaiono',
      answer: 'Possibili cause: 1) Database corrotto (ripristina backup), 2) Permessi file insufficienti (verifica data/lume.db), 3) Errore nel backend (controlla log console backend). Se persiste, contatta supporto con log errori.'
    },
    {
      id: 28,
      category: 'Problemi',
      question: 'Il calcolo del budget o obiettivo è sbagliato',
      answer: 'Verifica: 1) Budget: controlla se hai movimenti con "budget_id" esplicito che scalano da altri budget, 2) Obiettivi: controlla movimenti in ENTRATA con campo "obiettivo_id". Il campo "importo_attuale" in tabella obiettivi è deprecato, viene ricalcolato da movimenti.'
    },
  ];

  const categories = ['Tutte', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = selectedCategory === 'Tutte' || item.category === selectedCategory;
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft size={20} />}
              onClick={onBack}
            />
          )}
          <h1 style={{ 
            margin: 0, 
            fontSize: theme.typography.fontSize['2xl'], 
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm
          }}>
            <HelpCircle size={32} />
            Domande Frequenti (FAQ)
          </h1>
        </div>
        <p style={{ 
          margin: 0, 
          color: theme.colors.text.secondary, 
          fontSize: theme.typography.fontSize.sm 
        }}>
          Trova rapidamente le risposte alle tue domande
        </p>
      </div>

      {/* Search */}
      <Input
        placeholder="Cerca nelle FAQ..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        leftIcon={<Search size={18} />}
        fullWidth
      />

      {/* Category Filter */}
      <div style={{ 
        display: 'flex', 
        gap: theme.spacing.sm, 
        overflowX: 'auto',
        paddingBottom: theme.spacing.xs
      }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              borderRadius: theme.borderRadius.full,
              border: 'none',
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              whiteSpace: 'nowrap',
              transition: `all ${theme.transitions.base}`,
              backgroundColor: selectedCategory === category 
                ? theme.colors.primary.DEFAULT 
                : theme.colors.background,
              color: selectedCategory === category 
                ? '#ffffff' 
                : theme.colors.text.secondary,
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      {filteredFAQ.length === 0 ? (
        <Card padding="xl">
          <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
            <div style={{ fontSize: '64px', marginBottom: theme.spacing.md }}>🔍</div>
            <h3 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>Nessun risultato</h3>
            <p style={{ color: theme.colors.text.secondary }}>Prova a cercare con parole diverse</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          {filteredFAQ.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <Card
                key={item.id}
                hoverable
                padding="lg"
                onClick={() => toggleExpand(item.id)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.md }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.xs }}>
                      <span style={{
                        padding: `2px ${theme.spacing.xs}`,
                        borderRadius: theme.borderRadius.sm,
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.semibold,
                        backgroundColor: `${theme.colors.primary.DEFAULT}20`,
                        color: theme.colors.primary.DEFAULT,
                      }}>
                        {item.category}
                      </span>
                    </div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing.sm
                    }}>
                      {item.question}
                    </h3>
                    {isExpanded && (
                      <p style={{ 
                        margin: 0, 
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.secondary,
                        lineHeight: '1.6',
                        whiteSpace: 'pre-line'
                      }}>
                        {item.answer}
                      </p>
                    )}
                  </div>
                  <div style={{ color: theme.colors.text.secondary }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer Help */}
      <Card padding="lg">
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            margin: 0, 
            fontSize: theme.typography.fontSize.sm, 
            color: theme.colors.text.secondary 
          }}>
            Non hai trovato quello che cercavi?
          </p>
          <p style={{ 
            margin: `${theme.spacing.sm} 0 0 0`, 
            fontSize: theme.typography.fontSize.sm, 
            color: theme.colors.text.primary,
            fontWeight: theme.typography.fontWeight.medium
          }}>
            Controlla la documentazione completa su{' '}
            <a 
              href="https://github.com/Afellai3/lume-finance" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: theme.colors.primary.DEFAULT, textDecoration: 'none' }}
            >
              GitHub
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default FAQ;
