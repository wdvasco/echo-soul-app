import { useState } from 'react'
import { STYLE_PRESETS } from '../data/stylePresets'
import './ConfigPanel.css'

const TEMAS = [
  'Neon Shadows',
  'Midnight Drive',
  'Sunset Grooves',
  'Oceanic Depths',
  'Urban Pulse',
  'Desert Mirage',
  'Cosmic Lounge',
  'Underground Whispers',
  'Velvet Nights',
  'Ibiza Sunrise',
  'Concrete Jungle',
  'Lost in the Rhythm',
  'Hypnotic State'
]

const GENEROS = [
  'Deep House', 'Vocal House', 'Progressive House', 'Nu Disco',
  'Afro House', 'Tech House', 'Organic House', 'Melodic Techno',
]

const MOODS = [
  'Late-Night', 'Melancholic', 'Cinematic', 'Euphoric',
  'Hypnotic', 'Introspective', 'Sensual', 'Mysterious',
]

const INSTRUMENTOS = [
  'Rhodes', 'Saxophone', 'Sub-Bass', 'Synth Pads',
  'Guitar', 'Flute', 'Strings', 'Percussion',
]

const VOCAIS = ['Male Vocal', 'Female Vocal', 'Duet']

const DEFAULT_STATE = {
  tema: TEMAS[0],
  modo: 'criacao',
  bpm: 125,
  genero: 'Deep House',
  moods: [],
  instrumentacao: [],
  tipoVocal: 'Male Vocal',
  styleTagUsuario: '',
  selectedPresetId: '',
}

export default function ConfigPanel({ onGenerate, loading }) {
  const [form, setForm] = useState(DEFAULT_STATE)


  const bpmPct = ((form.bpm - 110) / (140 - 110)) * 100

  function toggleChip(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))
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

    setForm(prev => ({
      ...prev,
      selectedPresetId: preset.id,
      genero: preset.genero,
      bpm: preset.bpm,
      tipoVocal: preset.tipoVocal || prev.tipoVocal,
      moods: preset.moods || prev.moods,
      instrumentacao: preset.instrumentacao || prev.instrumentacao,
      styleTagUsuario: preset.styleTag,
      modo: 'execucao', // presets técnicos usam o modo de execução
    }))
  }

  function handleGenerateType(tipoGeracao) {
    onGenerate({
      tema: form.tema,
      modo: form.modo,
      bpm: form.bpm,
      genero: form.genero,
      moods: form.moods,
      instrumentacao: form.instrumentacao,
      tipo_vocal: form.tipoVocal,
      style_tag_usuario: form.modo === 'execucao' ? form.styleTagUsuario : undefined,
      tipo_geracao: tipoGeracao
    })
  }

  // Agrupar presets por categoria
  const techHousePresets = STYLE_PRESETS.filter(p => p.categoria === 'Tech House')
  const deepHousePresets = STYLE_PRESETS.filter(p => p.categoria !== 'Tech House')

  return (
    <form id="config-form" className="config-panel">
      {/* Tema */}
      <div className="form-group">
        <label className="form-label" htmlFor="tema-select">Tema ou Título</label>
        <select
          id="tema-select"
          className="form-select"
          value={form.tema}
          onChange={e => setForm(p => ({ ...p, tema: e.target.value }))}
          required
        >
          {TEMAS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Preset de Estilo Musical */}
      <div className="form-group">
        <div className="form-label-row">
          <label className="form-label" htmlFor="preset-select">Presets de Estilo Musical</label>
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
          <option value="">-- Personalizado / Escolha um Estilo Pronto --</option>
          <optgroup label="Tech House (130 BPM)">
            {techHousePresets.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </optgroup>
          <optgroup label="Deep House & Progressive (124 BPM)">
            {deepHousePresets.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </optgroup>
        </select>
        <p className="mode-hint">
          Selecione um estilo pronto para carregar BPM, gênero, vocal e arranjo técnico completo automaticamente.
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
            ? 'O sistema arquiteta o estilo técnico completo a partir do mood.'
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
            placeholder="Ex: 130 BPM, Tech House, rolling sub-bass, syncopated percussion, dark underground pulse..."
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
          <span className="slider-label">110</span>
          <input
            id="bpm-slider"
            type="range"
            min={110}
            max={140}
            value={form.bpm}
            style={{ '--pct': `${bpmPct}%` }}
            onChange={e => setForm(p => ({ ...p, bpm: Number(e.target.value) }))}
          />
          <span className="slider-label">140</span>
          <input
            type="number"
            className="slider-value-input"
            min={110}
            max={140}
            value={form.bpm === 0 ? '' : form.bpm}
            onChange={e => {
              const val = e.target.value === '' ? 0 : Number(e.target.value);
              setForm(p => ({ ...p, bpm: val }));
            }}
            onBlur={e => {
              let val = Number(e.target.value);
              if (val < 110) val = 110;
              if (val > 140) val = 140;
              setForm(p => ({ ...p, bpm: val }));
            }}
          />
        </div>
      </div>

      {/* Gênero */}
      <div className="form-group">
        <label className="form-label" htmlFor="genero-select">Gênero</label>
        <select
          id="genero-select"
          className="form-select"
          value={form.genero}
          onChange={e => setForm(p => ({ ...p, genero: e.target.value }))}
        >
          {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="divider" />

      {/* Mood */}
      <div className="form-group">
        <label className="form-label">Mood / Atmosfera</label>
        <div className="chips-grid">
          {MOODS.map(m => (
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
          {INSTRUMENTOS.map(i => (
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
