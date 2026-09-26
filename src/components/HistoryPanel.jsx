import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabase'
import './HistoryPanel.css'

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function getSongTitle(item) {
  return (
    item.output_json?.bloco1_audio?.titulo ||
    item.output_json?.prompt_suno?.titulo ||
    item.tema ||
    'Sem título'
  )
}

function getStyleTag(item) {
  return (
    item.output_json?.bloco1_audio?.style_tag ||
    item.output_json?.prompt_suno?.style_tag ||
    ''
  )
}

export default function HistoryPanel({ onSelect, onClose }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const searchInputRef = useRef(null)
  const PAGE_SIZE = 25

  async function load(p = 0, append = false) {
    setLoading(true)
    const from = p * PAGE_SIZE
    const to = from + PAGE_SIZE

    let query = supabase
      .from('outputs')
      .select('id, created_at, tema, modo, genero, bpm, output_json')
      .order('created_at', { ascending: false })
      .range(from, to)

    const { data, error } = await query

    if (!error && data) {
      const more = data.length > PAGE_SIZE
      if (more) data.pop()
      setItems(prev => append ? [...prev, ...data] : data)
      setHasMore(more)
      setPage(p)
    }
    setLoading(false)
  }

  useEffect(() => {
    load(0, false)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  function handleSelect(item) {
    onSelect(item.output_json)
    onClose()
  }

  // Filtragem no cliente (em tempo real) por título, tema, gênero, BPM e style tags
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return items.filter(item => {
      // Filtro de gênero
      if (selectedGenre && item.genero !== selectedGenre) {
        return false
      }

      if (!term) return true

      const songTitle = getSongTitle(item).toLowerCase()
      const tema = (item.tema || '').toLowerCase()
      const genero = (item.genero || '').toLowerCase()
      const modo = (item.modo || '').toLowerCase()
      const bpmStr = String(item.bpm || '')
      const styleTag = getStyleTag(item).toLowerCase()

      return (
        songTitle.includes(term) ||
        tema.includes(term) ||
        genero.includes(term) ||
        modo.includes(term) ||
        bpmStr.includes(term) ||
        styleTag.includes(term)
      )
    })
  }, [items, searchTerm, selectedGenre])

  // Gêneros presentes nos itens para filtro rápido
  const availableGenres = useMemo(() => {
    const set = new Set()
    items.forEach(i => {
      if (i.genero) set.add(i.genero)
    })
    return Array.from(set)
  }, [items])

  return (
    <div className="history-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="history-panel glass animate-fade-up">
        {/* Header */}
        <div className="history-header">
          <div className="history-header-title">
            <span className="history-icon">🎵</span>
            <h2>Músicas Criadas</h2>
          </div>
          <button id="history-close-btn" className="btn-icon" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        {/* Search Bar */}
        <div className="history-search-container">
          <div className="history-search-box">
            <span className="history-search-icon">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              className="history-search-input"
              placeholder="Buscar por título, tema, gênero, BPM..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="history-search-clear"
                onClick={() => setSearchTerm('')}
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Genre Filters */}
          {availableGenres.length > 0 && (
            <div className="history-genre-chips">
              <button
                type="button"
                className={`history-genre-chip ${selectedGenre === '' ? 'active' : ''}`}
                onClick={() => setSelectedGenre('')}
              >
                Todos
              </button>
              {availableGenres.map(g => (
                <button
                  key={g}
                  type="button"
                  className={`history-genre-chip ${selectedGenre === g ? 'active' : ''}`}
                  onClick={() => setSelectedGenre(prev => prev === g ? '' : g)}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* Results count info */}
          <div className="history-search-info">
            <span className="history-count">
              {filteredItems.length} {filteredItems.length === 1 ? 'música encontrada' : 'músicas encontradas'}
            </span>
            {(searchTerm || selectedGenre) && (
              <button
                type="button"
                className="history-reset-filter"
                onClick={() => { setSearchTerm(''); setSelectedGenre('') }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="history-body">
          {loading && items.length === 0 && (
            <div className="history-loading">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="history-skeleton">
                  <div className="skeleton" style={{ height: 16, width: '60%' }} />
                  <div className="skeleton" style={{ height: 12, width: '40%', marginTop: 8 }} />
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="history-empty">
              <div className="history-empty-icon">🎧</div>
              <p>Nenhuma música criada ainda.</p>
              <p className="history-empty-sub">Gere seu primeiro pacote no painel lateral!</p>
            </div>
          )}

          {!loading && items.length > 0 && filteredItems.length === 0 && (
            <div className="history-empty">
              <div className="history-empty-icon">🔍</div>
              <p>Nenhuma música encontrada para sua busca.</p>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginTop: 8 }}
                onClick={() => { setSearchTerm(''); setSelectedGenre('') }}
              >
                Limpar busca
              </button>
            </div>
          )}

          {filteredItems.map((item, i) => {
            const songTitle = getSongTitle(item)
            const styleTag = getStyleTag(item)

            return (
              <button
                key={item.id}
                id={`history-item-${i}`}
                className="history-item"
                onClick={() => handleSelect(item)}
              >
                <div className="history-item-main">
                  <div className="history-song-header">
                    <span className="history-item-song-title">{songTitle}</span>
                    {songTitle.toLowerCase() !== (item.tema || '').toLowerCase() && (
                      <span className="history-item-tema-hint">Tema: {item.tema}</span>
                    )}
                  </div>

                  <div className="history-item-meta">
                    <span className="history-badge history-badge-gold">{item.genero}</span>
                    <span className="history-badge">{item.bpm} BPM</span>
                    <span className={`history-badge history-badge-mode ${item.modo}`}>
                      {item.modo === 'criacao' ? 'Criação' : 'Execução'}
                    </span>
                  </div>

                  {styleTag && (
                    <div className="history-item-tag-snippet" title={styleTag}>
                      {styleTag}
                    </div>
                  )}
                </div>
                <span className="history-item-date">{formatDate(item.created_at)}</span>
              </button>
            )
          })}

          {hasMore && !searchTerm && !selectedGenre && (
            <button
              id="history-load-more-btn"
              className="btn btn-ghost history-load-more"
              onClick={() => load(page + 1, true)}
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Carregar mais músicas'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

