'use client';

import { useEffect, useRef, useState } from 'react';
import { initialize } from './experience';

const safeSource = value => typeof value === 'string' && (/^\/(?!\/)/.test(value) || /^https:\/\//.test(value));

function Heading({ title, accent }) {
  return <h2>{title}<br /><em>{accent}</em></h2>;
}

function Countdown({ date, timezone, locale }) {
  const [remaining, setRemaining] = useState(null);
  const target = Date.parse(date);
  useEffect(() => {
    if (!Number.isFinite(target)) return;
    const tick = () => setRemaining(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);
  const units = remaining === null ? ['—', '—', '—', '—'] : [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
  return <>
    <p id="event-date">{Number.isFinite(target) ? new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short', hourCycle: 'h23', timeZone: timezone }).format(new Date(target)) + ' hs' : 'Fecha por confirmar'}</p>
    <div className="timer" aria-label="Cuenta regresiva">
      {units.map((value, i) => <div key={i}><b>{String(value).padStart(2, '0')}</b><span>{['DÍAS', 'HORAS', 'MINUTOS', 'SEGUNDOS'][i]}</span></div>)}
    </div>
    <p className="small">{remaining === 0 ? '¡Llegó el día de celebrar!' : 'Una noche. Mil recuerdos. Vos, conmigo.'}</p>
  </>;
}

function Music({ music }) {
  const [opened, setOpened] = useState(false);
  if (!music?.enabled) return null;
  const localAudio = safeSource(music.src);
  const videoId = /^[a-zA-Z0-9_-]{11}$/.test(music.youtubeId || '') ? music.youtubeId : null;
  return <aside className="music-widget" aria-label="Música de la invitación">
    {opened && <div className="music-panel" id="music-panel">
      <div className="music-heading"><div><strong>{music.title}</strong><small>{music.artist}</small></div><button type="button" onClick={() => setOpened(false)} aria-label="Cerrar y detener música">×</button></div>
      {localAudio ? <audio controls autoPlay loop src={music.src}>Tu navegador no admite audio.</audio> : videoId ? <><iframe title={music.title} src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&loop=1&playlist=${videoId}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /><a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">Escuchar en YouTube ↗</a></> : <p>La música estará disponible pronto.</p>}
    </div>}
    <button className="music-toggle" type="button" aria-expanded={opened} aria-controls={opened ? 'music-panel' : undefined} onClick={() => setOpened(!opened)}><span aria-hidden="true">♫</span>{opened ? 'Cerrar música' : 'Escuchar la magia'}</button>
  </aside>;
}

function ReplyForm({ config, kind }) {
  const [status, setStatus] = useState('');
  function submit(event) {
    event.preventDefault();
    const phone = String(config.whatsapp || '').replace(/\D/g, '');
    if (!phone) { setStatus('Pronto habilitaremos los envíos. Todavía no se envió tu respuesta.'); return; }
    const data = new FormData(event.currentTarget);
    const message = kind === 'rsvp'
      ? `¡Hola ${config.name}! Soy ${data.get('name')}. ${data.get('attendance')} (${data.get('guests')}). ${data.get('notes') || ''}`
      : `¡${config.name}! Quiero bailar ${data.get('song')} de ${data.get('artist')}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setStatus(`Terminá el envío en WhatsApp para que ${config.name} reciba tu mensaje.`);
  }
  return <form onSubmit={submit} id={`${kind}-form`}>
    {kind === 'rsvp' ? <>
      <label>Tu nombre y apellido<input name="name" autoComplete="name" placeholder="¿Cómo te llamás?" required maxLength={100} /></label>
      <div className="form-row"><label>¿Venís a celebrar?<select name="attendance"><option>¡Sí, ahí estaré!</option><option>No podré asistir</option></select></label><label>Personas<select name="guests">{[1, 2, 3, 4].map(n => <option key={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>)}</select></label></div>
      <label>¿Algo que deba saber?<input name="notes" placeholder="Alimentación especial o un mensajito" maxLength={400} /></label>
    </> : <><label>Canción<input name="song" placeholder="Nombre de la canción" required maxLength={120} /></label><label>Artista<input name="artist" placeholder="¿Quién la canta?" required maxLength={120} /></label></>}
    <button type="submit" className={kind === 'song' ? 'outline' : ''}>{kind === 'rsvp' ? 'Confirmar por WhatsApp' : 'Sugerir por WhatsApp'} <span>↗</span></button>
    <p className="form-status" role="status">{status}</p>
  </form>;
}

function Gifts({ gifts }) {
  const [status, setStatus] = useState('');
  if (!gifts?.enabled) return null;
  const active = gifts.active === true && !!gifts.alias?.trim();
  async function copyAlias() {
    if (!active) return;
    try { await navigator.clipboard.writeText(gifts.alias); setStatus('Alias copiado. ¡Gracias por ser parte de este sueño!'); }
    catch { setStatus('No se pudo copiar automáticamente. Podés seleccionar y copiar el alias que aparece arriba.'); }
  }
  return <section className="gifts section" id="regalos"><div className="gift-flower" aria-hidden="true">❋</div><div className="reveal">
    <p className="eyebrow">UN DETALLE CON MUCHO AMOR</p><Heading title={gifts.title} accent={gifts.subtitle} /><p className="gift-message">{gifts.message}</p>
    <div className={`gift-account ${active ? '' : 'pending'}`}><span>{gifts.provider}</span><strong>{gifts.alias || 'Alias por confirmar'}</strong>{gifts.recipient && <small>Titular: {gifts.recipient}</small>}<button type="button" onClick={copyAlias} disabled={!active}>{active ? 'Copiar alias ↗' : 'Alias de ejemplo · No habilitado'}</button></div>
    {!active && <p className="gift-pending">{gifts.pendingMessage}</p>}<p role="status" className="form-status">{status}</p>
  </div></section>;
}

function Invitation({ config }) {
  const dialog = useRef(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const copy = config.copy;
  useEffect(() => {
    document.title = `${config.name} · ${config.celebration}`;
    return initialize(config);
  }, [config]);
  function openPhoto(photo) { setSelectedPhoto(photo); dialog.current.showModal(); }
  const query = encodeURIComponent(config.address || '');
  return <>
    <div id="scene" aria-hidden="true" /><div className="grain" />
    <header><a className="monogram" href="#inicio" aria-label={`${config.name}, inicio`}>{config.name.slice(0, 1)}<span>✧</span></a><nav><a href="#historia">La noche</a><a href="#recuerdos">Mi historia</a><a href="#ubicacion">Cómo llegar</a>{config.gifts?.enabled && <a href="#regalos">Regalos</a>}</nav><a className="nav-rsvp" href="#rsvp">Confirmar asistencia <span>↗</span></a></header>
    <main>
      <section id="inicio" className="hero"><div className="hero-top"><p className="eyebrow">{copy.heroEyebrow}</p><h1>{config.name}</h1><div className="xv"><span />{config.celebration.toUpperCase()}<span /></div></div><div className="hero-bottom"><p>{copy.heroQuote}</p><a className="scroll" href="#historia"><span>↓</span> DESLIZÁ Y DEJATE LLEVAR</a><div className="hero-note">{copy.heroNote}<span>✦</span></div></div></section>
      <section id="historia" className="story section"><div className="story-copy reveal"><p className="eyebrow">EL SUEÑO</p><Heading title={copy.storyTitle} accent={copy.storyAccent} />{copy.storyParagraphs.map((text, i) => <p key={i}>{text}</p>)}<span className="signature">Con amor, {config.name}</span></div></section>
      <section id="recuerdos" className="memory-journey">
        <div className="journey-intro section"><p className="eyebrow">{copy.timelineEyebrow}</p><Heading title={copy.timelineTitle} accent={copy.timelineAccent} /><p>{copy.timelineIntro}</p><span className="journey-star" aria-hidden="true">✧</span></div>
        <div className="timeline-path" id="timeline-path"><div className="timeline-line" aria-hidden="true"><div className="timeline-fill" /></div>
          {config.timeline.map((chapter, i) => <article className={`memory-step ${i % 2 ? 'right' : 'left'}`} key={i} data-step={i}>
            <div className="memory-marker" aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
            <div className="memory-card"><p className="eyebrow">{chapter.label}</p><h3>{chapter.title}</h3><div className={`memory-photos count-${chapter.photos.length}`}>
              {chapter.photos.filter(photo => safeSource(photo.src)).map((photo, j) => <button className="memory-photo" key={photo.src} onClick={() => openPhoto(photo)} aria-label={`Ampliar: ${photo.alt}`}><img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" style={{ objectPosition: photo.position || '50% 50%' }} /><span aria-hidden="true">↗</span></button>)}
            </div><p className="memory-caption">{chapter.description}</p><span className="memory-ornament" aria-hidden="true">✦</span></div>
          </article>)}
        </div><div className="journey-end"><span>✧</span><p>Y ahora… vamos a celebrar.</p><a href="#noche" className="scroll"><span>↓</span> LA PRÓXIMA PÁGINA</a></div>
      </section>
      <section className="countdown section" id="noche"><div className="reveal"><p className="eyebrow">EL GRAN MOMENTO</p><Heading title={copy.countdownTitle} accent={copy.countdownAccent} /><Countdown date={config.date} timezone={config.timezone} locale={config.locale} /></div></section>
      <section id="ubicacion" className="location section"><div className="map-art" aria-hidden="true"><div className="map-river" /><span className="pin">✧</span><span className="map-label">EL LUGAR DONDE<br />COMIENZA LA MAGIA</span></div><div className="reveal"><p className="eyebrow">NUESTRO ENCUENTRO</p><Heading title={copy.locationTitle} accent={copy.locationAccent} /><h3>{config.venue}</h3><p>{config.address}</p><div className="map-buttons">{config.address ? <><a className="button" href={`https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noopener noreferrer">Google Maps ↗</a><a className="button outline" href={`https://waze.com/ul?q=${query}&navigate=yes`} target="_blank" rel="noopener noreferrer">Waze ↗</a></> : <p>Dirección por confirmar</p>}</div></div></section>
      <section className="participate section" id="rsvp"><div className="reveal"><p className="eyebrow">SOS PARTE DEL CUENTO</p><Heading title={copy.rsvpTitle} accent={copy.rsvpAccent} /><p>{copy.rsvpMessage}</p><ReplyForm config={config} kind="rsvp" /></div><div className="song reveal"><span className="record" aria-hidden="true">♫</span><p className="eyebrow">LA BANDA SONORA DE MI NOCHE</p><h3>{copy.songTitle}<br /><em>{copy.songAccent}</em></h3><p>{copy.songMessage}</p><ReplyForm config={config} kind="song" /></div></section>
      <Gifts gifts={config.gifts} />
      <footer><p className="eyebrow">{copy.footerEyebrow}</p><a href="#inicio">{config.name}<span>✧</span></a><p>{config.celebration} · Una noche encantada</p><small>{copy.footerNote}</small></footer>
    </main>
    <Music music={config.music} />
    <dialog ref={dialog} id="lightbox" aria-label="Recuerdo ampliado" onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}><button aria-label="Cerrar galería" onClick={() => dialog.current.close()}>×</button>{selectedPhoto && <img src={selectedPhoto.src} alt={selectedPhoto.alt} />}</dialog>
  </>;
}

export default function Home() {
  const [config, setConfig] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/invitacion.json', { cache: 'no-store', signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('No se pudo cargar la invitación');
      return response.json();
    }).then(data => {
      if (!data.name || !data.copy || !Array.isArray(data.timeline)) throw new Error('Revisá invitacion.json');
      setConfig(data);
    }).catch(error => { if (error.name !== 'AbortError') setFailed(true); });
    return () => controller.abort();
  }, []);
  if (!config) return <main className="loading-invitation"><span>✧</span><p>{failed ? 'No pudimos abrir la invitación. Revisá la configuración e intentá de nuevo.' : 'La magia está por comenzar…'}</p>{failed && <button onClick={() => window.location.reload()}>Volver a intentar</button>}<noscript>Activá JavaScript para abrir la invitación.</noscript></main>;
  return <Invitation config={config} />;
}

