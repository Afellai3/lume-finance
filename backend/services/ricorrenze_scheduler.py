"""Scheduler per esecuzione automatica movimenti ricorrenti"""

import logging
from datetime import datetime, date
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from ..database import get_db_connection, dict_from_row
from ..models import MovimentoRicorrente, FrequenzaRicorrenza
from ..routes.ricorrenze import calcola_prossima_data

logger = logging.getLogger(__name__)


def esegui_ricorrenze_scadute():
    """
    Esegue tutte le ricorrenze con prossima_data <= oggi.
    
    Chiamato automaticamente dal cron job.
    """
    logger.info("=" * 60)
    logger.info("INIZIO ESECUZIONE RICORRENZE AUTOMATICHE")
    logger.info(f"Data: {datetime.now().isoformat()}")
    logger.info("=" * 60)
    
    try:
        with get_db_connection() as conn:
            # Trova ricorrenze da eseguire
            query = """
                SELECT * FROM movimenti_ricorrenti
                WHERE attivo = 1
                AND prossima_data <= ?
                AND (data_fine IS NULL OR data_fine >= ?)
                ORDER BY prossima_data ASC
            """
            
            oggi = date.today().isoformat()
            cursor = conn.execute(query, (oggi, oggi))
            ricorrenze = cursor.fetchall()
            
            if not ricorrenze:
                logger.info("\u2714\ufe0f Nessuna ricorrenza da eseguire oggi")
                return
            
            logger.info(f"\ud83d\udd0d Trovate {len(ricorrenze)} ricorrenze da eseguire")
            
            eseguite = 0
            errori = 0
            
            for row in ricorrenze:
                ric_dict = dict_from_row(row)
                ric_id = ric_dict['id']
                
                try:
                    logger.info(f"\n  \u27a1\ufe0f Esecuzione ricorrenza #{ric_id}: {ric_dict['descrizione']}")
                    
                    # Crea movimento
                    importo_movimento = ric_dict['importo'] if ric_dict['tipo'] == 'entrata' else -abs(ric_dict['importo'])
                    
                    cursor = conn.execute(
                        """
                        INSERT INTO movimenti (
                            data, importo, tipo, conto_id, categoria_id,
                            budget_id, obiettivo_id, bene_id, descrizione, note, ricorrente
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                        """,
                        (
                            datetime.now().isoformat(),
                            importo_movimento,
                            ric_dict['tipo'],
                            ric_dict['conto_id'],
                            ric_dict['categoria_id'],
                            ric_dict['budget_id'],
                            ric_dict['obiettivo_id'],
                            ric_dict['bene_id'],
                            f"[AUTO] {ric_dict['descrizione']}",
                            ric_dict['note']
                        )
                    )
                    movimento_id = cursor.lastrowid
                    logger.info(f"    \u2714\ufe0f Movimento creato: ID={movimento_id}")
                    
                    # Aggiorna saldo conto se presente
                    if ric_dict['conto_id']:
                        conn.execute(
                            "UPDATE conti SET saldo = saldo + ? WHERE id = ?",
                            (importo_movimento, ric_dict['conto_id'])
                        )
                        logger.info(f"    \ud83d\udcb0 Saldo conto aggiornato: {importo_movimento:+.2f}\u20ac")
                    
                    # Calcola prossima data
                    ric_obj = MovimentoRicorrente(**ric_dict)
                    prossima = calcola_prossima_data(ric_obj, date.today())
                    
                    # Aggiorna ricorrenza
                    conn.execute(
                        "UPDATE movimenti_ricorrenti SET prossima_data = ? WHERE id = ?",
                        (prossima.isoformat(), ric_id)
                    )
                    logger.info(f"    \ud83d\uddd3\ufe0f Prossima esecuzione: {prossima}")
                    
                    eseguite += 1
                    
                except Exception as e:
                    logger.error(f"    \u274c Errore durante esecuzione ricorrenza #{ric_id}: {str(e)}")
                    errori += 1
            
            # Commit finale
            conn.commit()
            
            logger.info("\n" + "=" * 60)
            logger.info(f"RIEPILOGO ESECUZIONE:")
            logger.info(f"  \u2714\ufe0f Eseguite con successo: {eseguite}")
            if errori > 0:
                logger.warning(f"  \u274c Errori: {errori}")
            logger.info("=" * 60)
            
    except Exception as e:
        logger.error(f"\u274c ERRORE CRITICO durante esecuzione ricorrenze: {str(e)}")
        raise


# Scheduler globale
scheduler = None


def start_scheduler():
    """
    Avvia lo scheduler in background.
    
    Da chiamare all'avvio dell'applicazione.
    """
    global scheduler
    
    if scheduler is not None:
        logger.warning("\u26a0\ufe0f Scheduler gi\u00e0 avviato")
        return
    
    logger.info("\ud83d\ude80 Avvio scheduler movimenti ricorrenti...")
    
    scheduler = BackgroundScheduler()
    
    # Esegui ogni giorno alle 00:01
    scheduler.add_job(
        esegui_ricorrenze_scadute,
        CronTrigger(hour=0, minute=1),
        id='ricorrenze_job',
        name='Esecuzione movimenti ricorrenti',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("\u2714\ufe0f Scheduler avviato (esecuzione: ogni giorno alle 00:01)")
    
    # Esegui anche subito al primo avvio (opzionale)
    logger.info("\ud83d\udd04 Esecuzione iniziale ricorrenze...")
    try:
        esegui_ricorrenze_scadute()
    except Exception as e:
        logger.error(f"Errore durante esecuzione iniziale: {e}")


def stop_scheduler():
    """Ferma lo scheduler"""
    global scheduler
    
    if scheduler is not None:
        logger.info("\ud83d\uded1 Arresto scheduler...")
        scheduler.shutdown()
        scheduler = None
        logger.info("\u2714\ufe0f Scheduler arrestato")
