import { useState, useEffect } from 'react'
import './Beni.css'
import BeneCard from '../components/BeneCard'
import BeneForm from '../components/BeneForm'
import { Bene } from '../types'

function Beni() {
  const [beni, setBeni] = useState<Bene[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBene, setEditingBene] = useState<Bene | null>(null)

  const fetchBeni = async () => {
    try {
      const response = await fetch('/api/beni')
      if (!response.ok) throw new Error('Errore caricamento beni')
      const data = await response.json()
      setBeni(data)
    } catch (error) {
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBeni()
  }, [])

  const handleCreate = () => {
    setEditingBene(null)
    setShowForm(true)
  }

  const handleEdit = (bene: Bene) => {
    setEditingBene(bene)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo bene?')) return

    try {
      const response = await fetch(`/api/beni/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Errore eliminazione')
      await fetchBeni()
    } catch (error) {
      alert('Errore durante l\'eliminazione')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingBene(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingBene(null)
    fetchBeni()
  }

  if (loading) {
    return (
      <div className="beni-page">
        <div className="loading">Caricamento beni...</div>
      </div>
    )
  }

  return (
    <div className="beni-page">
      <header className="page-header">
        <div>
          <h1>🚗 Beni</h1>
          <p className="page-subtitle">Gestisci auto, elettrodomestici e altri beni</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          ➕ Nuovo Bene
        </button>
      </header>

      {showForm && (
        <BeneForm
          bene={editingBene}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {beni.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">📦</p>
          <h3>Nessun bene registrato</h3>
          <p>Aggiungi il tuo primo bene per iniziare a tracciare i costi</p>
          <button className="btn btn-primary" onClick={handleCreate}>
            ➕ Aggiungi Bene
          </button>
        </div>
      ) : (
        <div className="beni-grid">
          {beni.map((bene) => (
            <BeneCard
              key={bene.id}
              bene={bene}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Beni
