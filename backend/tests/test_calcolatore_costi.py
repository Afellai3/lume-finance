"""Test per il Calcolatore Costi"""

import pytest
from datetime import date
from backend.services.calcolatore_costi import (
    CalcolatoreVeicolo,
    CalcolatoreElettrodomestico,
    RipartitoreUtenze
)


class TestCalcolatoreVeicolo:
    """Test per CalcolatoreVeicolo"""
    
    def setup_method(self):
        """Setup eseguito prima di ogni test"""
        self.auto = CalcolatoreVeicolo(
            nome_veicolo="Fiat Panda Test",
            tipo_carburante="benzina",
            consumo_medio_l_100km=5.5,
            costo_manutenzione_per_km=0.08,
            prezzo_acquisto=12000.0,
            data_acquisto=date(2020, 1, 1)
        )
    
    def test_calcolo_viaggio_100km(self):
        """Test calcolo costo viaggio 100km"""
        risultato = self.auto.calcola_costo_viaggio(
            km_percorsi=100,
            prezzo_carburante_al_litro=1.80
        )
        
        # Verifica struttura risultato
        assert risultato.importo_totale > 0
        assert len(risultato.componenti) == 3  # Carburante, Usura, Ammortamento
        
        # Verifica nomi componenti
        nomi_componenti = [c.nome for c in risultato.componenti]
        assert "Carburante" in nomi_componenti
        assert "Usura e Manutenzione" in nomi_componenti
        assert "Ammortamento" in nomi_componenti
        
        # Verifica che le percentuali sommino a ~100%
        somma_percentuali = sum(c.percentuale for c in risultato.componenti)
        assert 99.0 <= somma_percentuali <= 101.0
    
    def test_carburante_corretto(self):
        """Test che il calcolo carburante sia corretto"""
        risultato = self.auto.calcola_costo_viaggio(
            km_percorsi=100,
            prezzo_carburante_al_litro=2.0
        )
        
        comp_carburante = [c for c in risultato.componenti if c.nome == "Carburante"][0]
        
        # 100 km con consumo 5.5 L/100km = 5.5 litri
        # 5.5 litri × 2.0 €/L = 11.0 €
        assert comp_carburante.valore == 11.0
        assert comp_carburante.parametri["litri_consumati"] == 5.5
    
    def test_usura_corretta(self):
        """Test calcolo usura"""
        risultato = self.auto.calcola_costo_viaggio(
            km_percorsi=50,
            prezzo_carburante_al_litro=1.80
        )
        
        comp_usura = [c for c in risultato.componenti if "Usura" in c.nome][0]
        
        # 50 km × 0.08 €/km = 4.0 €
        assert comp_usura.valore == 4.0


class TestCalcolatoreElettrodomestico:
    """Test per CalcolatoreElettrodomestico"""
    
    def setup_method(self):
        """Setup eseguito prima di ogni test"""
        self.frigo = CalcolatoreElettrodomestico(
            nome_elettrodomestico="Frigo Test",
            potenza_watt=150,
            ore_utilizzo_giorno=24,
            prezzo_acquisto=600.0,
            data_acquisto=date(2023, 1, 1),
            durata_anni_stimata=10
        )
    
    def test_calcolo_mensile(self):
        """Test calcolo costo mensile"""
        risultato = self.frigo.calcola_costo_mensile(prezzo_kwh=0.25)
        
        assert risultato.importo_totale > 0
        assert len(risultato.componenti) == 2  # Elettricità e Ammortamento
        
        nomi = [c.nome for c in risultato.componenti]
        assert "Consumo Elettrico" in nomi
        assert "Ammortamento" in nomi
    
    def test_consumo_elettrico_corretto(self):
        """Test calcolo consumo elettrico preciso"""
        risultato = self.frigo.calcola_costo_periodo(
            giorni=30,
            prezzo_kwh=0.30
        )
        
        comp_elettrico = [c for c in risultato.componenti if "Elettrico" in c.nome][0]
        
        # 150W × 24h/giorno × 30 giorni = 108 kWh
        # 108 kWh × 0.30 €/kWh = 32.4 €
        assert comp_elettrico.parametri["kwh_consumati"] == 108.0
        assert comp_elettrico.valore == 32.4
    
    def test_ore_custom(self):
        """Test con ore di utilizzo custom"""
        # Lavatrice usata 10 ore totali nel mese
        lavatrice = CalcolatoreElettrodomestico(
            "Lavatrice", 2000, 1.5, 500.0, date(2023, 1, 1)
        )
        
        risultato = lavatrice.calcola_costo_periodo(
            giorni=30,
            prezzo_kwh=0.25,
            ore_effettive_totali=10
        )
        
        comp_elettrico = [c for c in risultato.componenti if "Elettrico" in c.nome][0]
        
        # 2000W × 10h = 20 kWh
        # 20 kWh × 0.25 €/kWh = 5.0 €
        assert comp_elettrico.parametri["kwh_consumati"] == 20.0
        assert comp_elettrico.valore == 5.0


class TestRipartitoreUtenze:
    """Test per RipartitoreUtenze"""
    
    def test_ripartizione_elettrodomestici(self):
        """Test ripartizione bolletta tra elettrodomestici"""
        frigo = CalcolatoreElettrodomestico(
            "Frigo", 150, 24, 600, date(2023, 1, 1)
        )
        lavatrice = CalcolatoreElettrodomestico(
            "Lavatrice", 2000, 1.5, 500, date(2023, 1, 1)
        )
        
        ripartizione = RipartitoreUtenze.ripartisci_per_elettrodomestici(
            importo_bolletta=100.0,
            elettrodomestici=[frigo, lavatrice],
            prezzo_kwh_bolletta=0.25,
            giorni_periodo=30
        )
        
        # Verifica che la somma sia circa 100€
        somma = sum(ripartizione.values())
        assert 99.0 <= somma <= 101.0
        
        # Verifica che entrambi abbiano un valore
        assert ripartizione["Frigo"] > 0
        assert ripartizione["Lavatrice"] > 0
    
    def test_ripartizione_stanze(self):
        """Test ripartizione per stanze con percentuali"""
        distribuzione = {
            "Cucina": 40,
            "Soggiorno": 30,
            "Camera": 30
        }
        
        ripartizione = RipartitoreUtenze.ripartisci_per_stanze(
            importo_bolletta=150.0,
            distribuzione_percentuale=distribuzione
        )
        
        # Verifica importi corretti
        assert ripartizione["Cucina"] == 60.0  # 40% di 150
        assert ripartizione["Soggiorno"] == 45.0  # 30% di 150
        assert ripartizione["Camera"] == 45.0  # 30% di 150
        
        # Verifica somma
        assert sum(ripartizione.values()) == 150.0
    
    def test_normalizzazione_percentuali(self):
        """Test che percentuali non al 100% vengano normalizzate"""
        distribuzione = {
            "Stanza1": 50,
            "Stanza2": 30
        }  # Somma = 80, non 100
        
        ripartizione = RipartitoreUtenze.ripartisci_per_stanze(
            importo_bolletta=80.0,
            distribuzione_percentuale=distribuzione
        )
        
        # Deve normalizzare: 50/80 = 62.5%, 30/80 = 37.5%
        assert ripartizione["Stanza1"] == 50.0
        assert ripartizione["Stanza2"] == 30.0
        assert sum(ripartizione.values()) == 80.0