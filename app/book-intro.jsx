'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './book-intro.css';
import './book-interaction.css';

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
      // A bounded particle pool follows the same writing path as the wand.
      root.current.querySelectorAll('.wand-spark').forEach((spark, index) => {
        const start = .6 + index * .025;
        const progress = (start - .6) / 3.2;
        const left = `${8 + progress * 77}%`;
        const top = `${51.5 + Math.cos(progress * Math.PI * 8) * 3.5}%`;
        tl.fromTo(spark, {left, top, x:0, y:0, opacity:1, scale:.3}, {
          x:Math.sin(index * 2.4) * (25 + index % 55),
          y:Math.cos(index * 1.7) * (25 + index % 65), opacity:0, scale:1.2,
          duration:1.2, ease:'power2.out'
        }, start);
      });
    }, root);
    return () => context.revert();
  }, []);
  useEffect(() => {
    if (!opening) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onEnter(); return; }
    const context = gsap.context(() => {
      const stage = document.getElementById('invitation-stage');
      const book = root.current.querySelector('.enchanted-book');
      const page = root.current.querySelector('.book-paper');
      gsap.set(book, {rotation:0});
      const rect = book.getBoundingClientRect();
      const sx = rect.width / innerWidth, sy = rect.height / innerHeight;
      gsap.set(stage, {visibility:'visible',zIndex:31,transformOrigin:'0 0',x:rect.left,y:rect.top,scaleX:sx,scaleY:sy,borderRadius:18});
      gsap.set(root.current, {background:'transparent',position:'fixed',inset:0,zIndex:32});
      gsap.set(page, {opacity:1,background:'transparent',boxShadow:'inset 0 0 28px #e8d9a866, 0 0 30px #dcca8544',borderColor:'#cabc83'});
      gsap.set(book, {transformOrigin:'0 0',filter:'none'});
      gsap.timeline({onComplete:onEnter})
        .to('.book-cover',{rotationY:-170,duration:2.4,ease:'sine.inOut'})
        .to('.book-hint, .book-intro > .eyebrow',{opacity:0,duration:1.2},.4)
        // Keep the physical page and its invitation aligned throughout the zoom.
        .to(stage,{x:0,y:0,scaleX:1,scaleY:1,borderRadius:0,duration:4.8,ease:'sine.inOut'},2)
        .to(book,{x:-rect.left,y:-rect.top,scaleX:1/sx,scaleY:1/sy,duration:4.8,ease:'sine.inOut'},2)
        .to(page,{borderColor:'transparent',boxShadow:'inset 0 0 0px #e8d9a800, 0 0 0px #dcca8500',duration:1.2},6.4)
        .to(root.current,{opacity:0,duration:1.2},6.4);
    }, root);
    return () => {
      context.revert();
      gsap.set(document.getElementById('invitation-stage'), {clearProps:'all'});
      window.dispatchEvent(new Event('resize'));
    };
  }, [opening, onEnter]);
  return <main ref={root} className="book-intro">
    <p className="eyebrow">CADA SUEÑO TIENE SU HISTORIA</p>
    <div className="book-perspective"><div className="enchanted-book" role="button" tabIndex={opening ? -1 : 0} aria-label="Abrir la invitación" aria-disabled={opening} onClick={() => { if (!opening) setOpening(true); }} onKeyDown={event => { if (!opening && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setOpening(true); } }}>
      <div className="book-paper" aria-hidden="true" />
      <div className="book-cover"><div className="book-border">
        <p className="eyebrow">UN CUENTO HECHO REALIDAD</p>
        <div className="book-lettering"><h1 className="book-name">{config.name}</h1><span className="magic-wand" aria-hidden="true"><svg viewBox="0 0 80 240" className="crystal-staff">
          <defs>
            <linearGradient id="staff-wood"><stop stopColor="#24180f"/><stop offset=".45" stopColor="#98714b"/><stop offset=".65" stopColor="#4c3020"/><stop offset="1" stopColor="#160f0b"/></linearGradient>
            <linearGradient id="staff-metal"><stop stopColor="#755d34"/><stop offset=".4" stopColor="#fff0b6"/><stop offset=".65" stopColor="#b7ad8b"/><stop offset="1" stopColor="#57452b"/></linearGradient>
            <linearGradient id="staff-crystal" x2="1" y2="1"><stop stopColor="#fffce0"/><stop offset=".3" stopColor="#a3ecff"/><stop offset=".6" stopColor="#fff3ba"/><stop offset="1" stopColor="#54aebc"/></linearGradient>
          </defs>
          <path d="M34 63 Q29 120 37 232 L46 232 Q42 120 46 63Z" fill="url(#staff-wood)" stroke="#bc9766" strokeWidth="1"/>
          <g fill="url(#staff-crystal)" stroke="#fff6d2" strokeWidth="1.3"><path d="M40 3 53 25 44 66 30 27Z"/><path d="M14 18 32 30 37 65 19 48Z"/><path d="M66 19 49 32 44 65 61 47Z"/></g>
          <g fill="none" stroke="#fff" opacity=".8"><path d="m40 3 2 28 2 38M14 18l11 21 12 26M66 19 55 40 44 65"/></g>
          <g fill="none" stroke="url(#staff-metal)" strokeWidth="3"><path d="M15 47Q40 91 65 47M22 54Q25 76 49 79Q65 59 40 53Q15 60 34 83M26 65Q43 59 54 68M31 88l17 2M32 94l16 2M35 161l10 2M35 168l10 2"/></g>
          <path d="m38 105 6 5-6 6 5 6-5 7 6 6-5 6" fill="none" stroke="#eddb9a" strokeWidth="1.5"/>
        </svg></span><span className="wand-sparks" aria-hidden="true">{Array.from({length:128}, (_, index) => <span className="wand-spark" key={index} />)}</span></div>
        <p className="book-celebration">{config.celebration}</p>
      </div></div>
    </div></div>
    <p className="book-hint" aria-live="polite">{opening ? 'Abriendo tu cuento…' : 'Tocá el libro para abrir la invitación'}</p>
  </main>;
}
