import { useState } from 'react'
import './MovimentiFilters.css'
import { Categoria, Conto } from '../types'

interface Filters {
  search: string
  tipo: string
  categoria_id: string
  conto_id: string
  data_da: string
  data_a: string
  ordine: string
}

interface MovimentiFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onReset: () => void
  categorie: Categoria[]
  conti: Conto[]
}

function MovimentiFilters({ filters, onFiltersChange, onReset, categorie, conti }: MovimentiFiltersProps) {
  const handleChange = (field: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [field]: value })
  }

  const activeFiltersCount = Object.entries(filters)
    .filter(([key, value]) => key !== 'ordine' && value)
    .length

  return (
    <div className="movimenti-filters">
      <div className="filters-header">
        <h3>🔍 Filtri e Ricerca</h3>
        {activeFiltersCount > 0 && (
          <button className="btn-reset" onClick={onReset}>
            ↺ Resetta ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="filters-grid">
        {/* Ricerca testuale */}
        <div className="filter-group full-width">
          <label>🔎 Cerca</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Cerca per descrizione, categoria o conto..."
          />
        </div>

        {/* Filtri principali */}
        <div className="filter-group">
          <label>💰 Tipo</label>
          <select
            value={filters.tipo}
            onChange={(e) => handleChange('tipo', e.target.value)}
          >
            <option value="">Tutti i tipi</option>
            <option value="entrata">💰 Entrate</option>
            <option value="uscita">💸 Uscite</option>
            <option value="trasferimento">🔄 Trasferimenti</option>
          </select>
        </div>

        <div className="filter-group">
          <label>📊 Categoria</label>
          <select
            value={filters.categoria_id}
            onChange={(e) => handleChange('categoria_id', e.target.value)}
          >
            <option value="">Tutte le categorie</option>
            {categorie.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icona} {cat.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>🏦 Conto</label>
          <select
            value={filters.conto_id}
            onChange={(e) => handleChange('conto_id', e.target.value)}
          >
            <option value="">Tutti i conti</option>
            {conti.map((conto) => (
              <option key={conto.id} value={conto.id}>
                {conto.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Filtri data */}
        <div className="filter-group">
          <label>📅 Data da</label>
          <input
            type="date"
            value={filters.data_da}
            onChange={(e) => handleChange('data_da', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>📅 Data a</label>
          <input
            type="date"
            value={filters.data_a}
            onChange={(e) => handleChange('data_a', e.target.value)}
          />
        </div>

        {/* Ordinamento */}
        <div className="filter-group">
          <label>↕️ Ordina per</label>
          <select
            value={filters.ordine}
            onChange={(e) => handleChange('ordine', e.target.value)}
          >
            <option value="data_desc">📅 Data (più recenti)</option>
            <option value="data_asc">📅 Data (più vecchi)</option>
            <option value="importo_desc">💰 Importo (maggiori)</option>
            <option value="importo_asc">💰 Importo (minori)</option>
            <option value="categoria">📊 Categoria (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default MovimentiFilters
