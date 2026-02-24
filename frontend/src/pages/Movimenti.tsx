import { useState, useEffect } from 'react'
import './Movimenti.css'
import MovimentoForm from '../components/MovimentoForm'
import MovimentoList from '../components/MovimentoList'
import { Movimento } from '../types'

function Movimenti() {
  const [movimenti, setMovimenti] = useState<Movimento[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMovimenti = async () => {
    try {
      const response = await fetch('/api/movimenti?limite=50')
      const data = await response.json()
      setMovimenti(data)
    } catch (error) {
      console.error('Errore caricamento movimenti:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovimenti()
  }, [])

  const handleMovimentoCreated = () => {
    fetchMovimenti()
  }

  return (
    <div className="movimenti-page">
      <header className="page-header">
        <h1>💸 Movimenti</h1>
        <p className="page-subtitle">Gestisci le tue entrate e uscite</p>
      </header>

      <div className="movimenti-grid">
        <section className="form-section">
          <MovimentoForm onSuccess={handleMovimentoCreated} />
        </section>

        <section className="list-section">
          <h2>Ultimi Movimenti</h2>
          {loading ? (
            <p>Caricamento...</p>
          ) : (
            <MovimentoList movimenti={movimenti} onRefresh={fetchMovimenti} />
          )}
        </section>
      </div>
    </div>
  )
}

export default Movimenti
