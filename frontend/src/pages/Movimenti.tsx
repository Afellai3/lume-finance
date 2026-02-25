import { useState, useEffect } from 'react'
import './Movimenti.css'
import MovimentoCard from '../components/MovimentoCard'
import MovimentoForm from '../components/MovimentoForm'
import MovimentiFilters from '../components/MovimentiFilters'
import MovimentoDetailModal from '../components/MovimentoDetailModal'
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

interface PaginatedResponse {
  items: Movimento[]
  total: number
  page: number
  per_page: number
  total_pages: number
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
  const [detailMovimentoId, setDetailMovimentoId] = useState<number | null>(null)
  const [exporting, setExporting] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const perPage = 50
  
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
    setLoading(true)
    try {
      // Parse ordinamento
      const [orderBy, orderDir] = filters.ordine.split('_')
      
      const [movRes, catRes, contiRes] = await Promise.all([
        fetch(`/api/movimenti?page=${currentPage}&per_page=${perPage}&order_by=${orderBy}&order_dir=${orderDir}`),
        fetch('/api/movimenti/categorie'),
        fetch('/api/conti')
      ])

      if (!movRes.ok || !catRes.ok || !contiRes.ok) {
        throw new Error('Errore caricamento dati')
      }

      const movimentiData: PaginatedResponse = await movRes.json()
      const categorieData = await catRes.json()
      const contiData = await contiRes.json()

      setMovimenti(movimentiData.items)
      setTotalPages(movimentiData.total_pages)
      setTotalItems(movimentiData.total)
      setCategorie(categorieData)
      setConti(contiData)
    } catch (error) {
      console.error('Errore:', error)
      alert('Errore durante il caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, filters.ordine])

  // Reset page on filter change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [filters.search, filters.tipo, filters.categoria_id, filters.conto_id, filters.data_da, filters.data_a])

  // Applica filtri lato client (su risultati pagina corrente)
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
    setCurrentPage(1)
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/movimenti/export')
      if (!response.ok) throw new Error('Errore export')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `movimenti_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Errore durante l\'export CSV')
    } finally {
      setExporting(false)
    }
  }

  const handleCardClick = (movimento: Movimento) => {
    setDetailMovimentoId(movimento.id)
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
            {totalItems} {totalItems === 1 ? 'movimento' : 'movimenti'} totali
            {isFilterActive() && ` • ${movimentiFiltrati.length} filtrati`}
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={handleExportCSV}
            disabled={exporting || totalItems === 0}
          >
            {exporting ? '⏳' : '💾'} Esporta CSV
          </button>
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

      {detailMovimentoId && (
        <MovimentoDetailModal
          movimentoId={detailMovimentoId}
          onClose={() => setDetailMovimentoId(null)}
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
        <>
          <div className="movimenti-list">
            {movimentiFiltrati.map((movimento) => (
              <div key={movimento.id} onClick={() => handleCardClick(movimento)}>
                <MovimentoCard
                  movimento={movimento}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {/* Paginazione */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Precedente
              </button>

              <div className="pagination-info">
                Pagina <strong>{currentPage}</strong> di <strong>{totalPages}</strong>
              </div>

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Successiva →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Movimenti
