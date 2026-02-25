import { useState } from 'react'
import './BeneCard.css'
import { Bene } from '../types'

interface BeneCardProps {
  bene: Bene
  onEdit: (bene: Bene) => void
  onDelete: (id: number) => void
}

function BeneCard({ bene, onEdit, onDelete }: BeneCardProps) {
  const [showActions, setShowActions] = useState(false)

  const getTipoIcon = () => {
    switch (bene.tipo) {
      case 'veicolo': return '🚗'
      case 'elettrodomestico': return '🏠'
      default: return '📦'
    }
  }

  const getTipoLabel = () => {
    switch (bene.tipo) {
      case 'veicolo': return 'Veicolo'
      case 'elettrodomestico': return 'Elettrodomestico'
      default: return 'Altro'
    }
  }

  const getAcquistoDate = () => {
    return new Date(bene.data_acquisto).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <div 
      className="bene-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="bene-card-header">
        <div className="bene-icon">{getTipoIcon()}</div>
        <div className="bene-header-info">
          <h3 className="bene-nome">{bene.nome}</h3>
          <span className="bene-tipo-badge">{getTipoLabel()}</span>
        </div>
      </div>

      <div className="bene-details">
        <div className="bene-detail-row">
          <span className="detail-label">📅 Acquisto</span>
          <span className="detail-value">{getAcquistoDate()}</span>
        </div>
        
        <div className="bene-detail-row">
          <span className="detail-label">💰 Prezzo</span>
          <span className="detail-value">{bene.prezzo_acquisto.toFixed(2)} €</span>
        </div>

        {bene.tipo === 'veicolo' && (
          <>
            <div className="bene-detail-row">
              <span className="detail-label">⛽ Carburante</span>
              <span className="detail-value">
                {bene.veicolo_tipo_carburante || 'N/A'}
              </span>
            </div>
            <div className="bene-detail-row">
              <span className="detail-label">📊 Consumo</span>
              <span className="detail-value">
                {bene.veicolo_consumo_medio ? `${bene.veicolo_consumo_medio} L/100km` : 'N/A'}
              </span>
            </div>
          </>
        )}

        {bene.tipo === 'elettrodomestico' && (
          <>
            <div className="bene-detail-row">
              <span className="detail-label">⚡ Potenza</span>
              <span className="detail-value">
                {bene.elettrodomestico_potenza ? `${bene.elettrodomestico_potenza} W` : 'N/A'}
              </span>
            </div>
            <div className="bene-detail-row">
              <span className="detail-label">⏱️ Uso giornaliero</span>
              <span className="detail-value">
                {bene.elettrodomestico_ore_medie_giorno ? `${bene.elettrodomestico_ore_medie_giorno} h` : 'N/A'}
              </span>
            </div>
          </>
        )}

        <div className="bene-detail-row">
          <span className="detail-label">📉 Durata stimata</span>
          <span className="detail-value">{bene.durata_anni_stimata || 'N/A'} anni</span>
        </div>
      </div>

      {showActions && (
        <div className="bene-actions">
          <button 
            className="btn-icon btn-edit"
            onClick={() => onEdit(bene)}
            title="Modifica"
          >
            ✏️
          </button>
          <button 
            className="btn-icon btn-delete"
            onClick={() => onDelete(bene.id!)}
            title="Elimina"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  )
}

export default BeneCard
