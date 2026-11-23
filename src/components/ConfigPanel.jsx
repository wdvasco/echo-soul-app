import { useState } from 'react'
import { STYLE_PRESETS } from '../data/stylePresets'
import {
  GENRE_GROUPS,
  getDefaultBpmForGenre,
  getInstrumentsForGenre,
  getMoodsForGenre,
  getThemesForGenre,
} from '../data/genreCatalog'
import './ConfigPanel.css'

const VOCAIS = ['Male Vocal', 'Female Vocal', 'Duet']

const BPM_MIN = 60
const BPM_MAX = 190

const INITIAL_GENRE = 'Deep House'

const DEFAULT_STATE = {
  genero: INITIAL_GENRE,
  tema: getThemesForGenre(INITIAL_GENRE)[0],
  customTema: '',
  isCustomTema: false,
  modo: 'criacao',
  bpm: getDefaultBpmForGenre(INITIAL_GENRE),
  moods: [],
  instrumentacao: [],
  tipoVocal: 'Male Vocal',
  styleTagUsuario: '',
  selectedPresetId: '',
}

export default function ConfigPanel({ onGenerate, loading }) {
  const [form, setForm] = useState(DEFAULT_STATE)

  const genreThemes = getThemesForGenre(form.genero)
  const genreMoods = getMoodsForGenre(form.genero)
  const genreInstruments = getInstrumentsForGenre(form.genero)
  const bpmPct = Math.max(0, Math.min(100, ((form.bpm - BPM_MIN) / (BPM_MAX - BPM_MIN)) * 100))

  function toggleChip(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))
  }

  function handleGenreChange(newGenre) {
    const nextThemes = getThemesForGenre(newGenre)
    const nextBpm = getDefaultBpmForGenre(newGenre)
    const allowedMoods = new Set(getMoodsForGenre(newGenre))
    const allowedInstruments = new Set(getInstrumentsForGenre(newGenre))
    setForm(prev => {
      const keepPreset = prev.selectedPresetId &&
        STYLE_PRESETS.find(p => p.id === prev.selectedPresetId)?.genero === newGenre
      return {
        ...prev,
        genero: newGenre,
        tema: prev.isCustomTema ? prev.tema : nextThemes[0],
        bpm: nextBpm,
        moods: prev.moods.filter(m => allowedMoods.has(m)),
        instrumentacao: prev.instrumentacao.filter(i => allowedInstruments.has(i)),
        selectedPresetId: keepPreset ? prev.selectedPresetId : '',
      }
    })
  }

  function handlePresetSelect(presetId) {
    if (!presetId) {
      setForm(prev => ({
        ...prev,
        selectedPresetId: '',
      }))
      return
    }

    const preset = STYLE_PRESETS.find(p => p.id === presetId)
    if (!preset) return

    const presetThemes = getThemesForGenre(preset.genero)
    setForm(prev => ({
      ...prev,
      selectedPresetId: preset.id,
      genero: preset.genero,
      tema: prev.isCustomTema
        ? prev.tema
        : (presetThemes.includes(prev.tema) ? prev.tema : presetThemes[0]),
      bpm: preset.bpm,
      tipoVocal: preset.tipoVocal || prev.tipoVocal,
      moods: preset.moods || prev.moods,
      instrumentacao: preset.instrumentacao || prev.instrumentacao,
      styleTagUsuario: preset.styleTag,
      modo: 'execucao',
    }))
  }

  function handleGenerateType(tipoGeracao) {
    const finalTema = form.isCustomTema
      ? (form.customTema.trim() || genreThemes[0])
      : form.tema
    onGenerate({
      tema: finalTema,
      modo: form.modo,
      bpm: form.bpm,
      genero: form.genero,
      moods: form.moods,
      instrumentacao: form.instrumentacao,
      tipo_vocal: form.tipoVocal,
      style_tag_usuario: form.modo === 'execucao' ? form.styleTagUsuario : undefined,
      tipo_geracao: tipoGeracao,
    })
  }

  const matchingPresets = STYLE_PRESETS.filter(p => p.genero === form.genero)
  const otherPresets = STYLE_PRESETS.filter(p => p.genero !== form.genero)
  const otherPresetGroups = otherPresets.reduce((acc, preset) => {
    const cat = preset.categoria || 'Outros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(preset)
    return acc
  }, {})

  return (
    <form id="config-form" className="config-panel">
      {/* 1. Gênero */}
      <div className="form-group">
        <label className="form-label" htmlFor="genero-select">1. Gênero Musical</label>
        <select
          id="genero-select"
          className="form-select"
          value={form.genero}
          onChange={e => handleGenreChange(e.target.value)}
        >
          {GENRE_GROUPS.map(group => (
            <optgroup key={group.label} label={group.label}>
              {group.genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* 2. Tema ou Título (contextualizado ao gênero) */}
      <div className="form-group">
        <label className="form-label" htmlFor="tema-select">2. Tema ou Título</label>
        <select
          id="tema-select"
          className="form-select"
          value={form.isCustomTema ? '__custom__' : form.tema}
          onChange={e => {
            if (e.target.value === '__custom__') {
              setForm(p => ({ ...p, isCustomTema: true }))
            } else {
              setForm(p => ({ ...p, isCustomTema: false, tema: e.target.value }))
            }
          }}
          required
        >
          <option value="__custom__">✏️ Personalizado (digitar tema livre)...</option>
          {genreThemes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {form.isCustomTema && (
          <input
            id="tema-custom-input"
            type="text"
            className="form-input"
            style={{ marginTop: 8 }}
            placeholder="Ex: Rain on Sunset Boulevard, 1994..."
            value={form.customTema}
            onChange={e => setForm(p => ({ ...p, customTema: e.target.value }))}
          />
        )}
      </div>

      {/* 3. Preset de Estilo Musical (prioriza o gênero escolhido) */}
      <div className="form-group">
        <div className="form-label-row">
          <label className="form-label" htmlFor="preset-select">3. Presets de Estilo</label>
          {form.selectedPresetId && (
            <button
              type="button"
              className="preset-clear-btn"
              onClick={() => handlePresetSelect('')}
              title="Limpar seleção de preset"
            >
              Limpar
            </button>
          )}
        </div>
        <select
          id="preset-select"
          className="form-select preset-select"
          value={form.selectedPresetId}
          onChange={e => handlePresetSelect(e.target.value)}
        >
          <option value="">-- Personalizado / Sem Preset --</option>
          {matchingPresets.length > 0 && (
            <optgroup label={`Recomendados para ${form.genero}`}>
              {matchingPresets.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </optgroup>
          )}
          {Object.entries(otherPresetGroups).map(([categoria, list]) => (
            <optgroup key={categoria} label={`Outros — ${categoria}`}>
              {list.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="mode-hint">
          Opcional: carregue um arranjo técnico pronto para preencher BPM, vocal e style tag automaticamente.
        </p>
      </div>

      {/* Modo */}
      <div className="form-group">
        <label className="form-label">Modo de Operação</label>
        <div className="mode-toggle">
          <button
            type="button"
            id="modo-criacao-btn"
            className={`mode-btn ${form.modo === 'criacao' ? 'active' : ''}`}
            onClick={() => setForm(p => ({ ...p, modo: 'criacao' }))}
          >
            Criação
          </button>
          <button
            type="button"
            id="modo-execucao-btn"
            className={`mode-btn ${form.modo === 'execucao' ? 'active' : ''}`}
            onClick={() => setForm(p => ({ ...p, modo: 'execucao' }))}
          >
            Execução
          </button>
        </div>
        <p className="mode-hint">
          {form.modo === 'criacao'
            ? 'O sistema arquiteta o estilo técnico completo a partir do gênero e do mood.'
            : 'Forneça suas keywords técnicas — o sistema as incorpora integralmente.'}
        </p>
      </div>

      {/* Style Tag (apenas Execução) */}
      {form.modo === 'execucao' && (
        <div className="form-group animate-fade-in">
          <div className="form-label-row">
            <label className="form-label" htmlFor="style-tag-input">Keywords Técnicas (Style Tag)</label>
            {form.selectedPresetId && (
              <span className="preset-active-tag">Preset Ativo</span>
            )}
          </div>
          <textarea
            id="style-tag-input"
            className="form-input form-textarea"
            rows={4}
            placeholder="Ex: 118 BPM, 90s Seattle grunge, distorted guitars, raspy male vocal..."
            value={form.styleTagUsuario}
            onChange={e => setForm(p => ({ ...p, styleTagUsuario: e.target.value }))}
          />
        </div>
      )}

      <div className="divider" />

      {/* BPM */}
      <div className="form-group">
        <label className="form-label">BPM</label>
        <div className="slider-container">
          <span className="slider-label">{BPM_MIN}</span>
          <input
            id="bpm-slider"
            type="range"
            min={BPM_MIN}
            max={BPM_MAX}
            value={form.bpm}
            style={{ '--pct': `${bpmPct}%` }}
            onChange={e => setForm(p => ({ ...p, bpm: Number(e.target.value) }))}
          />
          <span className="slider-label">{BPM_MAX}</span>
          <input
            type="number"
            className="slider-value-input"
            min={BPM_MIN}
            max={BPM_MAX}
            value={form.bpm === 0 ? '' : form.bpm}
            onChange={e => {
              const val = e.target.value === '' ? 0 : Number(e.target.value);
              setForm(p => ({ ...p, bpm: val }));
            }}
            onBlur={e => {
              let val = Number(e.target.value);
              if (val < BPM_MIN) val = BPM_MIN;
              if (val > BPM_MAX) val = BPM_MAX;
              setForm(p => ({ ...p, bpm: val }));
            }}
          />
        </div>
      </div>

      <div className="divider" />

      {/* Mood */}
      <div className="form-group">
        <label className="form-label">Mood / Atmosfera</label>
        <div className="chips-grid">
          {genreMoods.map(m => (
            <button
              key={m}
              type="button"
              className={`chip ${form.moods.includes(m) ? 'active' : ''}`}
              onClick={() => toggleChip('moods', m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Instrumentação */}
      <div className="form-group">
        <label className="form-label">Instrumentação</label>
        <div className="chips-grid">
          {genreInstruments.map(i => (
            <button
              key={i}
              type="button"
              className={`chip ${form.instrumentacao.includes(i) ? 'active' : ''}`}
              onClick={() => toggleChip('instrumentacao', i)}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo Vocal */}
      <div className="form-group">
        <label className="form-label">Tipo Vocal</label>
        <div className="vocal-grid">
          {VOCAIS.map(v => (
            <button
              key={v}
              type="button"
              id={`vocal-${v.toLowerCase().replace(' ', '-')}`}
              className={`vocal-btn ${form.tipoVocal === v ? 'active' : ''}`}
              onClick={() => setForm(p => ({ ...p, tipoVocal: v }))}
            >
              {v === 'Male Vocal' && '♂'}
              {v === 'Female Vocal' && '♀'}
              {v === 'Duet' && '⟡'}
              <span>{v}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button
          type="button"
          className="btn btn-primary generate-btn"
          disabled={loading}
          onClick={() => handleGenerateType('completo')}
        >
          {loading
            ? <><div className="spinner" style={{borderColor: 'rgba(201,168,76,0.2)', borderTopColor: '#C9A84C'}} /> Gerando...</>
            : <><span className="generate-icon">▶</span> Gerar Pacote Completo</>
          }
        </button>
        <button
          type="button"
          className="btn btn-ghost generate-btn"
          disabled={loading}
          onClick={() => handleGenerateType('suno')}
        >
          {loading
            ? <><div className="spinner" style={{borderColor: 'rgba(201,168,76,0.2)', borderTopColor: '#C9A84C'}} /> Gerando...</>
            : <><span className="generate-icon">♫</span> Apenas Prompt SUNO</>
          }
        </button>
      </div>
    </form>
  )
}
