import { useState, useEffect } from 'react'
import './Movimenti.css'
import MovimentoCard from '../components/MovimentoCard'
import MovimentoForm from '../components/MovimentoForm'
import MovimentiFilters from '../components/MovimentiFilters'
import { Movimento, Categoria, Conto } from '../types'

interface Filters {
  search: string
  tipo: string
  categoria_id: string
  conto_id: string
  data_da: string
  data_a: string
  ordine: string
}

function Movimenti() {
  const [movimenti, setMovimenti] = useState<Movimento[]>([])
  const [movimentiFiltrati, setMovimentiFiltrati] = useState<Movimento[]>([])
  const [categorie, setCategorie] = useState<Categoria[]>([])
  const [conti, setConti] = useState<Conto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMovimento, setEditingMovimento] = useState<Movimento | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    tipo: '',
    categoria_id: '',
    conto_id: '',
    data_da: '',
    data_a: '',
    ordine: 'data_desc'
  })

  const fetchData = async () => {
    try {
      const [movRes, catRes, contiRes] = await Promise.all([
        fetch('/api/movimenti'),
        fetch('/api/movimenti/categorie'),
        fetch('/api/conti')
      ])

      if (!movRes.ok || !catRes.ok || !contiRes.ok) {
        throw new Error('Errore caricamento dati')
      }

      const movimentiData = await movRes.json()
      const categorieData = await catRes.json()
      const contiData = await contiRes.json()

      setMovimenti(movimentiData)
      setMovimentiFiltrati(movimentiData)
      setCategorie(categorieData)
      setConti(contiData)
    } catch (error) {
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Applica filtri
  useEffect(() => {
    let risultati = [...movimenti]

    // Ricerca testuale
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      risultati = risultati.filter(m => 
        m.descrizione.toLowerCase().includes(searchLower) ||
        m.categoria_nome?.toLowerCase().includes(searchLower) ||
        m.conto_nome?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro tipo
    if (filters.tipo) {
      risultati = risultati.filter(m => m.tipo === filters.tipo)
    }

    // Filtro categoria
    if (filters.categoria_id) {
      risultati = risultati.filter(m => m.categoria_id?.toString() === filters.categoria_id)
    }

    // Filtro conto
    if (filters.conto_id) {
      risultati = risultati.filter(m => m.conto_id?.toString() === filters.conto_id)
    }

    // Filtro data da
    if (filters.data_da) {
      risultati = risultati.filter(m => m.data >= filters.data_da)
    }

    // Filtro data a
    if (filters.data_a) {
      risultati = risultati.filter(m => m.data <= filters.data_a + 'T23:59:59')
    }

    // Ordinamento
    switch (filters.ordine) {
      case 'data_desc':
        risultati.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        break
      case 'data_asc':
        risultati.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        break
      case 'importo_desc':
        risultati.sort((a, b) => b.importo - a.importo)
        break
      case 'importo_asc':
        risultati.sort((a, b) => a.importo - b.importo)
        break
      case 'categoria':
        risultati.sort((a, b) => (a.categoria_nome || '').localeCompare(b.categoria_nome || ''))
        break
    }

    setMovimentiFiltrati(risultati)
  }, [movimenti, filters])

  const handleCreate = () => {
    setEditingMovimento(null)
    setShowForm(true)
  }

  const handleEdit = (movimento: Movimento) => {
    setEditingMovimento(movimento)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo movimento?')) return

    try {
      const response = await fetch(`/api/movimenti/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Errore eliminazione')
      await fetchData()
    } catch (error) {
      alert('Errore durante l\'eliminazione')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingMovimento(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingMovimento(null)
    fetchData()
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      tipo: '',
      categoria_id: '',
      conto_id: '',
      data_da: '',
      data_a: '',
      ordine: 'data_desc'
    })
  }

  const isFilterActive = () => {
    return filters.search || filters.tipo || filters.categoria_id || 
           filters.conto_id || filters.data_da || filters.data_a
  }

  if (loading) {
    return (
      <div className="movimenti-page">
        <div className="loading">Caricamento movimenti...</div>
      </div>
    )
  }

  return (
    <div className="movimenti-page">
      <header className="page-header">
        <div>
          <h1>💸 Movimenti</h1>
          <p className="page-subtitle">
            {movimentiFiltrati.length} {movimentiFiltrati.length === 1 ? 'movimento' : 'movimenti'}
            {isFilterActive() && ` (filtrati da ${movimenti.length})`}
          </p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn ${showFilters ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 {showFilters ? 'Nascondi' : 'Filtri'}
            {isFilterActive() && <span className="filter-badge">{Object.values(filters).filter(v => v && v !== 'data_desc').length}</span>}
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>
            ➕ Nuovo Movimento
          </button>
        </div>
      </header>

      {showFilters && (
        <MovimentiFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleResetFilters}
          categorie={categorie}
          conti={conti}
        />
      )}

      {showForm && (
        <MovimentoForm
          movimento={editingMovimento}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          categorie={categorie}
          conti={conti}
        />
      )}

      {movimentiFiltrati.length === 0 ? (
        <div className="empty-state">
          {isFilterActive() ? (
            <>
              <p className="empty-icon">🔍</p>
              <h3>Nessun movimento trovato</h3>
              <p>Prova a modificare i filtri di ricerca</p>
              <button className="btn btn-secondary" onClick={handleResetFilters}>
                ↺ Resetta Filtri
              </button>
            </>
          ) : (
            <>
              <p className="empty-icon">💸</p>
              <h3>Nessun movimento registrato</h3>
              <p>Aggiungi il tuo primo movimento per iniziare</p>
              <button className="btn btn-primary" onClick={handleCreate}>
                ➕ Aggiungi Movimento
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="movimenti-list">
          {movimentiFiltrati.map((movimento) => (
            <MovimentoCard
              key={movimento.id}
              movimento={movimento}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Movimenti
