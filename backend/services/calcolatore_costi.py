"""Calcolatore Costi - Motore di scomposizione costi dettagliato

Questo modulo calcola la scomposizione dettagliata dei costi per:
- Veicoli (carburante, usura, ammortamento)
- Elettrodomestici (consumo elettrico, ammortamento)
- Utenze (ripartizione per centro di costo)
"""

from dataclasses import dataclass
from datetime import datetime, date
from typing import List, Optional, Dict
from decimal import Decimal


@dataclass
class ComponenteCosto:
    """Singolo componente di un costo scomposto"""
    nome: str
    valore: float
    unita: str
    percentuale: float
    metodo_calcolo: str
    parametri: Dict


@dataclass
class RisultatoScomposizione:
    """Risultato completo di una scomposizione costi"""
    importo_totale: float
    componenti: List[ComponenteCosto]
    bene_id: Optional[int] = None
    note: Optional[str] = None


class CalcolatoreVeicolo:
    """Calcola costi disaggregati per veicoli"""
    
    def __init__(self, 
                 nome_veicolo: str,
                 tipo_carburante: str,
                 consumo_medio_l_100km: float,
                 costo_manutenzione_per_km: float,
                 prezzo_acquisto: float,
                 data_acquisto: date,
                 durata_anni_stimata: int = 10,
                 tasso_ammortamento_annuo: float = 15.0):
        
        self.nome_veicolo = nome_veicolo
        self.tipo_carburante = tipo_carburante
        self.consumo_medio = consumo_medio_l_100km
        self.costo_manutenzione_per_km = costo_manutenzione_per_km
        self.prezzo_acquisto = prezzo_acquisto
        self.data_acquisto = data_acquisto
        self.durata_anni = durata_anni_stimata
        self.tasso_ammortamento = tasso_ammortamento_annuo
    
    def calcola_costo_viaggio(self, 
                              km_percorsi: float,
                              prezzo_carburante_al_litro: float,
                              data_viaggio: Optional[date] = None) -> RisultatoScomposizione:
        """
        Calcola la scomposizione completa dei costi per un viaggio.
        
        Args:
            km_percorsi: Chilometri percorsi
            prezzo_carburante_al_litro: Prezzo carburante al momento del viaggio (€/L)
            data_viaggio: Data del viaggio (default: oggi)
        
        Returns:
            RisultatoScomposizione con tutti i componenti di costo
        """
        if data_viaggio is None:
            data_viaggio = date.today()
        
        componenti = []
        
        # 1. CARBURANTE
        litri_consumati = (km_percorsi / 100) * self.consumo_medio
        costo_carburante = litri_consumati * prezzo_carburante_al_litro
        
        componenti.append(ComponenteCosto(
            nome="Carburante",
            valore=round(costo_carburante, 2),
            unita="EUR",
            percentuale=0,  # Calcolato dopo
            metodo_calcolo=f"({km_percorsi} km / 100) × {self.consumo_medio} L/100km × {prezzo_carburante_al_litro} €/L",
            parametri={
                "km_percorsi": km_percorsi,
                "litri_consumati": round(litri_consumati, 2),
                "consumo_medio": self.consumo_medio,
                "prezzo_litro": prezzo_carburante_al_litro
            }
        ))
        
        # 2. USURA E MANUTENZIONE
        costo_usura = km_percorsi * self.costo_manutenzione_per_km
        
        componenti.append(ComponenteCosto(
            nome="Usura e Manutenzione",
            valore=round(costo_usura, 2),
            unita="EUR",
            percentuale=0,
            metodo_calcolo=f"{km_percorsi} km × {self.costo_manutenzione_per_km} €/km",
            parametri={
                "km_percorsi": km_percorsi,
                "costo_per_km": self.costo_manutenzione_per_km
            }
        ))
        
        # 3. AMMORTAMENTO
        anni_eta = (data_viaggio - self.data_acquisto).days / 365.25
        valore_residuo = self.prezzo_acquisto * ((100 - self.tasso_ammortamento) / 100) ** anni_eta
        km_totali_stimati = self.durata_anni * 15000  # Stima media 15.000 km/anno
        costo_ammortamento_per_km = (self.prezzo_acquisto - valore_residuo) / km_totali_stimati
        costo_ammortamento = km_percorsi * costo_ammortamento_per_km
        
        componenti.append(ComponenteCosto(
            nome="Ammortamento",
            valore=round(costo_ammortamento, 2),
            unita="EUR",
            percentuale=0,
            metodo_calcolo=f"{km_percorsi} km × {round(costo_ammortamento_per_km, 4)} €/km (basato su deprezzamento {self.tasso_ammortamento}%/anno)",
            parametri={
                "km_percorsi": km_percorsi,
                "anni_eta": round(anni_eta, 1),
                "valore_acquisto": self.prezzo_acquisto,
                "valore_residuo": round(valore_residuo, 2),
                "tasso_ammortamento": self.tasso_ammortamento,
                "costo_ammortamento_per_km": round(costo_ammortamento_per_km, 4)
            }
        ))
        
        # Calcola totale e percentuali
        totale = sum(c.valore for c in componenti)
        for componente in componenti:
            componente.percentuale = round((componente.valore / totale) * 100, 1)
        
        return RisultatoScomposizione(
            importo_totale=round(totale, 2),
            componenti=componenti,
            note=f"Viaggio di {km_percorsi} km con {self.nome_veicolo}"
        )
    
    def calcola_costo_mensile_stimato(self, 
                                      km_mese: float,
                                      prezzo_carburante_medio: float) -> RisultatoScomposizione:
        """
        Stima il costo mensile medio dell'auto.
        
        Args:
            km_mese: Chilometri medi percorsi al mese
            prezzo_carburante_medio: Prezzo medio carburante (€/L)
        
        Returns:
            RisultatoScomposizione con stima mensile
        """
        return self.calcola_costo_viaggio(km_mese, prezzo_carburante_medio)


class CalcolatoreElettrodomestico:
    """Calcola costi di consumo elettrico per elettrodomestici"""
    
    def __init__(self,
                 nome_elettrodomestico: str,
                 potenza_watt: float,
                 ore_utilizzo_giorno: float,
                 prezzo_acquisto: float,
                 data_acquisto: date,
                 durata_anni_stimata: int = 10):
        
        self.nome = nome_elettrodomestico
        self.potenza_watt = potenza_watt
        self.ore_giorno = ore_utilizzo_giorno
        self.prezzo_acquisto = prezzo_acquisto
        self.data_acquisto = data_acquisto
        self.durata_anni = durata_anni_stimata
    
    def calcola_costo_periodo(self,
                             giorni: int,
                             prezzo_kwh: float,
                             ore_effettive_totali: Optional[float] = None) -> RisultatoScomposizione:
        """
        Calcola il costo di utilizzo per un periodo specifico.
        
        Args:
            giorni: Numero di giorni del periodo
            prezzo_kwh: Prezzo elettricità per kWh (€/kWh)
            ore_effettive_totali: Ore effettive di utilizzo (se diverso dalla media)
        
        Returns:
            RisultatoScomposizione con consumo elettrico e ammortamento
        """
        componenti = []
        
        # 1. CONSUMO ELETTRICO
        if ore_effettive_totali is None:
            ore_totali = self.ore_giorno * giorni
        else:
            ore_totali = ore_effettive_totali
        
        kwh_consumati = (self.potenza_watt / 1000) * ore_totali
        costo_elettricita = kwh_consumati * prezzo_kwh
        
        componenti.append(ComponenteCosto(
            nome="Consumo Elettrico",
            valore=round(costo_elettricita, 2),
            unita="EUR",
            percentuale=0,
            metodo_calcolo=f"({self.potenza_watt} W / 1000) × {round(ore_totali, 1)} ore × {prezzo_kwh} €/kWh",
            parametri={
                "potenza_watt": self.potenza_watt,
                "ore_utilizzo": round(ore_totali, 1),
                "kwh_consumati": round(kwh_consumati, 2),
                "prezzo_kwh": prezzo_kwh,
                "giorni": giorni
            }
        ))
        
        # 2. AMMORTAMENTO
        giorni_eta = (date.today() - self.data_acquisto).days
        giorni_vita_utile = self.durata_anni * 365
        costo_ammortamento_giornaliero = self.prezzo_acquisto / giorni_vita_utile
        costo_ammortamento = costo_ammortamento_giornaliero * giorni
        
        componenti.append(ComponenteCosto(
            nome="Ammortamento",
            valore=round(costo_ammortamento, 2),
            unita="EUR",
            percentuale=0,
            metodo_calcolo=f"{giorni} giorni × {round(costo_ammortamento_giornaliero, 4)} €/giorno (vita utile {self.durata_anni} anni)",
            parametri={
                "giorni": giorni,
                "prezzo_acquisto": self.prezzo_acquisto,
                "durata_anni": self.durata_anni,
                "costo_giornaliero": round(costo_ammortamento_giornaliero, 4)
            }
        ))
        
        # Calcola percentuali
        totale = sum(c.valore for c in componenti)
        for componente in componenti:
            componente.percentuale = round((componente.valore / totale) * 100, 1)
        
        return RisultatoScomposizione(
            importo_totale=round(totale, 2),
            componenti=componenti,
            note=f"Consumo {self.nome} per {giorni} giorni ({round(kwh_consumati, 2)} kWh)"
        )
    
    def calcola_costo_mensile(self, prezzo_kwh: float) -> RisultatoScomposizione:
        """Calcola il costo mensile medio"""
        return self.calcola_costo_periodo(30, prezzo_kwh)
    
    def calcola_costo_annuale(self, prezzo_kwh: float) -> RisultatoScomposizione:
        """Calcola il costo annuale"""
        return self.calcola_costo_periodo(365, prezzo_kwh)


class RipartitoreUtenze:
    """Ripartisce i costi delle utenze (energia, gas) tra centri di costo"""
    
    @staticmethod
    def ripartisci_per_elettrodomestici(importo_bolletta: float,
                                        elettrodomestici: List[CalcolatoreElettrodomestico],
                                        prezzo_kwh_bolletta: float,
                                        giorni_periodo: int = 30) -> Dict[str, float]:
        """
        Ripartisce l'importo della bolletta tra gli elettrodomestici in base al consumo.
        
        Args:
            importo_bolletta: Importo totale bolletta elettricità
            elettrodomestici: Lista di elettrodomestici da considerare
            prezzo_kwh_bolletta: Prezzo medio kWh della bolletta
            giorni_periodo: Giorni coperti dalla bolletta
        
        Returns:
            Dizionario {nome_elettrodomestico: importo_allocato}
        """
        # Calcola consumo totale
        consumi = {}
        consumo_totale_kwh = 0
        
        for elettrodomestico in elettrodomestici:
            ore_totali = elettrodomestico.ore_giorno * giorni_periodo
            kwh = (elettrodomestico.potenza_watt / 1000) * ore_totali
            consumi[elettrodomestico.nome] = kwh
            consumo_totale_kwh += kwh
        
        # Ripartisci proporzionalmente
        ripartizione = {}
        for nome, kwh in consumi.items():
            percentuale = kwh / consumo_totale_kwh if consumo_totale_kwh > 0 else 0
            ripartizione[nome] = round(importo_bolletta * percentuale, 2)
        
        return ripartizione
    
    @staticmethod
    def ripartisci_per_stanze(importo_bolletta: float,
                             distribuzione_percentuale: Dict[str, float]) -> Dict[str, float]:
        """
        Ripartisce la bolletta per stanze/centri di costo con percentuali manuali.
        
        Args:
            importo_bolletta: Importo totale bolletta
            distribuzione_percentuale: Dict {nome_stanza: percentuale}
        
        Returns:
            Dizionario {nome_stanza: importo_allocato}
        """
        ripartizione = {}
        
        # Normalizza percentuali se non sommano a 100
        totale_percentuale = sum(distribuzione_percentuale.values())
        
        for stanza, percentuale in distribuzione_percentuale.items():
            percentuale_normalizzata = percentuale / totale_percentuale if totale_percentuale > 0 else 0
            ripartizione[stanza] = round(importo_bolletta * percentuale_normalizzata, 2)
        
        return ripartizione


if __name__ == "__main__":
    # Test: Calcolo costo auto
    print("=" * 60)
    print("TEST CALCOLATORE VEICOLO")
    print("=" * 60)
    
    auto = CalcolatoreVeicolo(
        nome_veicolo="Fiat Panda 2020",
        tipo_carburante="benzina",
        consumo_medio_l_100km=5.5,
        costo_manutenzione_per_km=0.08,
        prezzo_acquisto=12000.0,
        data_acquisto=date(2020, 3, 15)
    )
    
    risultato_auto = auto.calcola_costo_viaggio(
        km_percorsi=100,
        prezzo_carburante_al_litro=1.85
    )
    
    print(f"\nViaggio: {risultato_auto.note}")
    print(f"TOTALE: {risultato_auto.importo_totale} EUR\n")
    
    for comp in risultato_auto.componenti:
        print(f"{comp.nome}: {comp.valore} EUR ({comp.percentuale}%)")
        print(f"  Calcolo: {comp.metodo_calcolo}")
        print()
    
    # Test: Calcolo elettrodomestico
    print("\n" + "=" * 60)
    print("TEST CALCOLATORE ELETTRODOMESTICO")
    print("=" * 60)
    
    frigo = CalcolatoreElettrodomestico(
        nome_elettrodomestico="Frigorifero Samsung",
        potenza_watt=150,
        ore_utilizzo_giorno=24,
        prezzo_acquisto=650.0,
        data_acquisto=date(2023, 6, 10)
    )
    
    risultato_frigo = frigo.calcola_costo_mensile(prezzo_kwh=0.25)
    
    print(f"\n{risultato_frigo.note}")
    print(f"TOTALE: {risultato_frigo.importo_totale} EUR\n")
    
    for comp in risultato_frigo.componenti:
        print(f"{comp.nome}: {comp.valore} EUR ({comp.percentuale}%)")
        print(f"  Calcolo: {comp.metodo_calcolo}")
        print()
    
    # Test: Ripartizione bolletta
    print("\n" + "=" * 60)
    print("TEST RIPARTIZIONE BOLLETTA")
    print("=" * 60)
    
    lavatrice = CalcolatoreElettrodomestico(
        "Lavatrice LG", 2000, 1.5, 450.0, date(2022, 9, 20)
    )
    
    ripartizione = RipartitoreUtenze.ripartisci_per_elettrodomestici(
        importo_bolletta=120.0,
        elettrodomestici=[frigo, lavatrice],
        prezzo_kwh_bolletta=0.25,
        giorni_periodo=30
    )
    
    print(f"\nBolletta totale: 120.00 EUR")
    print("Ripartizione per elettrodomestico:\n")
    for nome, importo in ripartizione.items():
        print(f"  {nome}: {importo} EUR")