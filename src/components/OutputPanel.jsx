import { useState } from 'react'
import './OutputPanel.css'

function CopyButton({ text, id, small }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* fallback */
    }
  }

  return (
    <button
      id={id}
      className={`btn btn-copy ${copied ? 'copied' : ''} ${small ? 'btn-copy-small' : ''}`}
      onClick={handleCopy}
      title="Copiar"
    >
      {copied ? '✓' : '⎘'}
      {!small && (copied ? ' Copiado' : ' Copiar')}
    </button>
  )
}

// Row with label + small copy button + content
function FieldSection({ label, text, id, children }) {
  return (
    <div className="field-section">
      <div className="field-section-header">
        <span className="field-label">{label}</span>
        <CopyButton text={text} id={id} small />
      </div>
      <div className="field-section-body">
        {children}
      </div>
    </div>
  )
}

function OutputBlock({ title, icon, delay, children }) {
  return (
    <div
      className="output-block glass animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="output-block-header">
        <div className="output-block-title">
          <span className="output-block-icon">{icon}</span>
          <span>{title}</span>
        </div>
      </div>
      <div className="output-block-body">
        {children}
      </div>
    </div>
  )
}

function SkeletonBlock({ delay }) {
  return (
    <div className="output-block glass" style={{ animationDelay: `${delay}ms` }}>
      <div className="output-block-header">
        <div className="skeleton" style={{ width: 160, height: 16 }} />
        <div className="skeleton" style={{ width: 70, height: 28, borderRadius: 6 }} />
      </div>
      <div className="output-block-body skeleton-body">
        <div className="skeleton" style={{ height: 14, width: '90%' }} />
        <div className="skeleton" style={{ height: 14, width: '75%' }} />
        <div className="skeleton" style={{ height: 14, width: '85%' }} />
        <div className="skeleton" style={{ height: 14, width: '60%' }} />
        <div className="skeleton" style={{ height: 14, width: '80%' }} />
      </div>
    </div>
  )
}

function Bloco1({ data }) {
  return (
    <OutputBlock title="Pacote Suno — Áudio" icon="🎵" delay={50}>
      <FieldSection label="Título" text={data.titulo} id="copy-b1-titulo">
        <p className="b1-title">{data.titulo}</p>
      </FieldSection>
      <FieldSection label="Letras" text={data.letras} id="copy-b1-letras">
        <pre className="b1-lyrics">{data.letras}</pre>
      </FieldSection>
      <FieldSection label="Style Tag (SUNO)" text={data.style_tag} id="copy-b1-styletag">
        <div className="b1-styletag">{data.style_tag}</div>
      </FieldSection>
    </OutputBlock>
  )
}

function Bloco2({ data }) {
  return (
    <OutputBlock title="Pacote Visual" icon="🎨" delay={150}>
      <FieldSection label="Arte Principal" text={data.arte_principal} id="copy-b2-arte">
        <p className="b2-text">{data.arte_principal}</p>
      </FieldSection>
      <FieldSection label="Thumbnail" text={data.thumbnail} id="copy-b2-thumb">
        <p className="b2-text">{data.thumbnail}</p>
      </FieldSection>
      <FieldSection label="Vídeo Loop / Visualizer" text={data.video_loop} id="copy-b2-loop">
        <p className="b2-text">{data.video_loop}</p>
      </FieldSection>
    </OutputBlock>
  )
}

function Bloco3({ data }) {
  const hashtagsStr = Array.isArray(data.hashtags) ? data.hashtags.join(' ') : data.hashtags
  return (
    <OutputBlock title="Pacote YouTube" icon="📺" delay={250}>
      <FieldSection label="Título do Vídeo" text={data.titulo} id="copy-b3-titulo">
        <p className="b3-title">{data.titulo}</p>
      </FieldSection>
      <FieldSection label="Descrição" text={data.descricao} id="copy-b3-desc">
        <pre className="b3-desc">{data.descricao}</pre>
      </FieldSection>
      <FieldSection label="Hashtags" text={hashtagsStr} id="copy-b3-hashtags">
        <div className="b3-hashtags">
          {Array.isArray(data.hashtags)
            ? data.hashtags.map((h, i) => <span key={i} className="b3-hashtag">{h}</span>)
            : <span className="b3-hashtag">{data.hashtags}</span>
          }
        </div>
      </FieldSection>
      <FieldSection label="Comentário Fixado" text={data.comentario_fixado} id="copy-b3-pin">
        <div className="b3-pinned">💬 {data.comentario_fixado}</div>
      </FieldSection>
    </OutputBlock>
  )
}

function Bloco4({ data }) {
  const tagsStr = Array.isArray(data.tags_youtube) ? data.tags_youtube.join(', ') : data.tags_youtube
  return (
    <OutputBlock title="Upgrade SEO" icon="📈" delay={350}>
      <FieldSection label="Tags do YouTube" text={tagsStr} id="copy-b4-tags">
        <p className="b4-hint">Cole estas tags no campo "Tags" ao fazer upload do vídeo:</p>
        <div className="b4-tags">
          {Array.isArray(data.tags_youtube)
            ? data.tags_youtube.map((t, i) => <span key={i} className="b4-tag">{t}</span>)
            : <span className="b4-tag">{data.tags_youtube}</span>
          }
        </div>
      </FieldSection>
    </OutputBlock>
  )
}

export default function OutputPanel({ output, loading }) {
  if (!output && !loading) {
    return (
      <div className="output-panel output-empty">
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <h2 className="empty-title">Pronto para criar</h2>
          <p className="empty-desc">
            Configure os parâmetros ao lado e clique em<br />
            <strong>Gerar Output</strong> para criar seu pacote completo.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="output-panel">
        {[0, 1, 2, 3].map(i => <SkeletonBlock key={i} delay={i * 60} />)}
      </div>
    )
  }

  const { bloco1_audio: b1, bloco2_visual: b2, bloco3_youtube: b3, bloco4_seo: b4 } = output

  return (
    <div className="output-panel">
      {b1 && <Bloco1 data={b1} />}
      {b2 && <Bloco2 data={b2} />}
      {b3 && <Bloco3 data={b3} />}
      {b4 && <Bloco4 data={b4} />}
    </div>
  )
}
