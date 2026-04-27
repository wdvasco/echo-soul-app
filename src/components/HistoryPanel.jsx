import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './HistoryPanel.css'

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function HistoryPanel({ onSelect, onClose }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const PAGE_SIZE = 10

  async function load(p = 0) {
    setLoading(true)
    const from = p * PAGE_SIZE
    const { data, error } = await supabase
      .from('outputs')
      .select('id, created_at, tema, modo, genero, bpm, output_json')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE)

    if (!error && data) {
      setItems(prev => p === 0 ? data : [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE + 1)
      if (data.length === PAGE_SIZE + 1) data.pop()
    }
    setLoading(false)
  }

  useEffect(() => { load(0) }, [])

  function handleSelect(item) {
    onSelect(item.output_json)
    onClose()
  }

  return (
    <div className="history-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="history-panel glass animate-fade-up">
        <div className="history-header">
          <div className="history-header-title">
            <span className="history-icon">🕐</span>
            <h2>Histórico</h2>
          </div>
          <button id="history-close-btn" className="btn-icon" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <div className="history-body">
          {loading && items.length === 0 && (
            <div className="history-loading">
              {[0,1,2,3].map(i => (
                <div key={i} className="history-skeleton">
                  <div className="skeleton" style={{ height: 14, width: '55%' }} />
                  <div className="skeleton" style={{ height: 11, width: '35%', marginTop: 6 }} />
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="history-empty">
              <p>Nenhum output gerado ainda.</p>
              <p>Crie seu primeiro pacote no painel!</p>
            </div>
          )}

          {items.map((item, i) => (
            <button
              key={item.id}
              id={`history-item-${i}`}
              className="history-item"
              onClick={() => handleSelect(item)}
            >
              <div className="history-item-main">
                <span className="history-item-tema">{item.tema}</span>
                <div className="history-item-meta">
                  <span className="history-badge">{item.genero}</span>
                  <span className="history-badge">{item.bpm} BPM</span>
                  <span className={`history-badge history-badge-mode ${item.modo}`}>
                    {item.modo === 'criacao' ? 'Criação' : 'Execução'}
                  </span>
                </div>
              </div>
              <span className="history-item-date">{formatDate(item.created_at)}</span>
            </button>
          ))}

          {hasMore && (
            <button
              id="history-load-more-btn"
              className="btn btn-ghost history-load-more"
              onClick={() => { const next = page + 1; setPage(next); load(next) }}
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Carregar mais'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
