'use client';
import { useRef, useState } from 'react';
import './music.css';

export default function Music({ music, onChoose }) {
  const audio = useRef(null);
  const [chosen, setChosen] = useState(false);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(60);
  const [status, setStatus] = useState('');
  const available = music?.enabled && typeof music.src === 'string' && (/^\/(?!\/)/.test(music.src) || /^https:\/\//.test(music.src));
  async function play() {
    if (!audio.current) return;
    setStatus('');
    audio.current.volume = volume / 100;
    try { await audio.current.play(); }
    catch { setStatus('No pudimos iniciar la canción. Tocá reproducir para intentarlo de nuevo.'); setOpened(true); }
  }
  function choose(withMusic) {
    // Playback must begin directly from the click, before the book mounts.
    if (withMusic) void play();
    setChosen(true);
    onChoose();
  }
  return <>
    {available && <audio ref={audio} src={music.src} preload="none" loop
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setPlaying(false); setStatus('La canción no está disponible en este momento. Podés seguir disfrutando la invitación.'); }} />}
    {!chosen && <main className="music-welcome"><div className="music-welcome-card">
      <span className="welcome-spark" aria-hidden="true">✧</span>
      <p className="eyebrow">TU INVITACIÓN A UNA NOCHE ENCANTADA</p>
      <h1>La magia está<br /><em>por comenzar</em></h1>
      <p>Hay historias que suenan aún más lindas.<br />¿Cómo querés vivir este cuento?</p>
      <div className="welcome-actions">
        {available && <button type="button" onClick={() => choose(true)}><span aria-hidden="true">♫</span> Entrar con música</button>}
        <button type="button" className="outline" onClick={() => choose(false)}>Disfrutar en silencio</button>
      </div><small>Podés cambiarlo cuando quieras.</small>
    </div></main>}
    {chosen && available && <aside className="music-widget" aria-label="Música de la invitación">
      {opened && <div className="music-panel" id="music-panel">
        <div className="music-heading"><div><strong>{music.title}</strong><small>{music.artist}</small></div><button type="button" onClick={() => setOpened(false)} aria-label="Cerrar controles de música">×</button></div>
        <button type="button" className="music-play" onClick={() => playing ? audio.current.pause() : void play()}>{playing ? 'Pausar la música' : 'Reproducir la música'}</button>
        <label className="music-volume" htmlFor="music-volume">Volumen <output>{volume}%</output>
          <input id="music-volume" type="range" min="0" max="100" value={volume} onChange={event => { const value=Number(event.target.value); setVolume(value); if(audio.current) audio.current.volume=value/100; }} />
        </label>
        <small>También podés usar los botones de volumen de tu dispositivo.</small>
        <p role="status">{status}</p>
      </div>}
      <button className="music-toggle" type="button" aria-expanded={opened} aria-controls={opened ? 'music-panel' : undefined} onClick={() => setOpened(!opened)}><span aria-hidden="true">♫</span>{opened ? 'Cerrar música' : 'Escuchar la magia'}</button>
    </aside>}
  </>;
}
