'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './book-intro.css';

export default function BookIntro({ config, onEnter }) {
  const root = useRef(null);
  const [opening, setOpening] = useState(false);
  useEffect(() => {
    const context = gsap.context(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const tl = gsap.timeline();
      tl.fromTo('.book-name', {clipPath:'inset(0 100% 0 0)'}, {clipPath:'inset(0 0% 0 0)',duration:3.2,ease:'none'}, .6);
      tl.fromTo('.magic-wand', {left:'8%',top:'55%',opacity:0}, {opacity:1,duration:.2}, .4);
      tl.to('.magic-wand', {left:'85%',duration:3.2,ease:'none'}, .6);
      tl.to('.magic-wand', {top:'48%',duration:.4,repeat:7,yoyo:true,ease:'sine.inOut'}, .6);
      tl.to('.magic-wand', {opacity:0,duration:.5}, 4);
    }, root);
    return () => context.revert();
  }, []);
  useEffect(() => {
    if (!opening) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onEnter(); return; }
    const context = gsap.context(() => {
      gsap.timeline({onComplete:onEnter})
        .to('.book-cover',{rotationY:-155,duration:1.5,ease:'power2.inOut'})
        .to('.enchanted-book',{scale:1.15,duration:1},0)
        .to(root.current,{opacity:0,duration:.7},1.2);
    }, root);
    return () => context.revert();
  }, [opening, onEnter]);
  return <main ref={root} className="book-intro">
    <p className="eyebrow">CADA SUEÑO TIENE SU HISTORIA</p>
    <div className="book-perspective"><div className="enchanted-book">
      <div className="book-paper"><span>✧</span><p>Había una vez<br />una noche soñada…</p></div>
      <div className="book-cover"><div className="book-border">
        <span className="book-lily" aria-hidden="true">❧</span>
        <p className="eyebrow">UN CUENTO HECHO REALIDAD</p>
        <div className="book-lettering"><h1 className="book-name">{config.name}</h1><span className="magic-wand" aria-hidden="true">✦<i /></span></div>
        <p className="book-celebration">{config.celebration}</p><span className="book-lily" aria-hidden="true">✧</span>
      </div></div>
    </div></div>
    <button autoFocus disabled={opening} onClick={() => setOpening(true)}>{opening ? 'Abriendo tu cuento…' : 'Abrir la invitación'} <span aria-hidden="true">✧</span></button>
    <p className="book-hint">La magia comienza al abrir este libro</p>
  </main>;
}
