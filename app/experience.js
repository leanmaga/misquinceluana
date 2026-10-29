import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

export function initialize(config) {
  const removers=[];
  const listen=(el,event,fn)=>{el.addEventListener(event,fn);removers.push(()=>el.removeEventListener(event,fn));};
  const date=new Date(config.date);
  const valid=Number.isFinite(date.getTime());
  const dateEl=document.querySelector('#event-date');
  if(valid) dateEl.textContent=date.toLocaleString('es-AR',{dateStyle:'long',timeStyle:'short',timeZone:'America/Argentina/Buenos_Aires'})+' h';
  if(config.demo){const note=document.createElement('p');note.className='demo-note';note.textContent='Fecha y lugar de ejemplo · A confirmar';dateEl.after(note);removers.push(()=>note.remove());}
  function tick(){if(!valid)return;let left=Math.max(0,Math.floor((date-Date.now())/1000));for(const [id,div] of [['days',86400],['hours',3600],['minutes',60],['seconds',1]]){document.getElementById(id).textContent=String(Math.floor(left/div)).padStart(2,'0');left%=div;}}
  tick();const interval=setInterval(tick,1000);
  if(config.venue)document.querySelector('#venue').textContent=config.venue;
  if(config.address)document.querySelector('#address').textContent=config.address+(config.demo?' · Ubicación de ejemplo':'');
  if(config.address){const query=encodeURIComponent(config.address);for(const [id,url] of [['google',`https://www.google.com/maps/search/?api=1&query=${query}`],['waze',`https://waze.com/ul?q=${query}&navigate=yes`]]){const a=document.getElementById(id);a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.removeAttribute('aria-disabled');}}
  for(const id of ['rsvp-form','song-form']){const form=document.getElementById(id);listen(form,'submit',e=>{e.preventDefault();const status=form.querySelector('.form-status');const data=new FormData(form);const phone=String(config.whatsapp||'').replace(/\D/g,'');if(!phone){status.textContent='Pronto habilitaremos los envíos. Todavía no se envió tu respuesta.';return;}const text=id==='rsvp-form'?`¡Hola Luana! Soy ${data.get('name')}. ${data.get('attendance')} (${data.get('guests')}). ${data.get('notes')||''}`:`¡Luana! Quiero bailar ${data.get('song')} de ${data.get('artist')}.`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');status.textContent='Terminá el envío en WhatsApp para que Luana reciba tu mensaje.';});}
  const dialog=document.getElementById('lightbox');listen(dialog.querySelector('button'),'click',()=>dialog.close());listen(dialog,'click',e=>{if(e.target===dialog)dialog.close();});
  if(Array.isArray(config.photos)&&config.photos.length){const gallery=document.querySelector('#photos');gallery.replaceChildren();config.photos.forEach((photo,i)=>{const src=typeof photo==='string'?photo:photo.src;if(!src || !(/^(https?:\/\/|\/)/.test(src)))return;const button=document.createElement('button');button.className='photo p'+(i%3+1);button.setAttribute('aria-label',`Ver recuerdo ${i+1} de Luana`);const img=document.createElement('img');img.src=src;img.alt=photo.alt||`Recuerdo ${i+1} de Luana`;img.loading='lazy';button.append(img);listen(button,'click',()=>{dialog.querySelector('img').src=src;dialog.showModal();});gallery.append(button);});}
  gsap.registerPlugin(ScrollTrigger);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const host=document.getElementById('scene');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{host.dataset.fallback='true';return()=>{clearInterval(interval);removers.forEach(fn=>fn());};}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;host.append(renderer.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#0b261f',.055);
  const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);camera.position.set(0,3.8,15);
  scene.add(new THREE.HemisphereLight(0xd7e8b3,0x193d30,2));const key=new THREE.DirectionalLight(0xffebbb,3);key.position.set(-4,8,5);scene.add(key);const rim=new THREE.PointLight(0xc5e590,45,20);rim.position.set(2,5,-3);scene.add(rim);
  const material=(color,roughness=.6,metalness=.05)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const skin=material('#ac754e'),leaf=material('#aabb73',.4),lightLeaf=material('#d3d99b',.45),darkLeaf=material('#759959'),hair=material('#231e16'),gold=material('#d9ca79',.3,.65),bark=material('#17382c');
  function mesh(geo,mat,parent,x=0,y=0,z=0){const obj=new THREE.Mesh(geo,mat);obj.position.set(x,y,z);parent.add(obj);return obj;}
  function sphere(parent,mat,x,y,z,sx,sy,sz){const m=mesh(new THREE.SphereGeometry(1,24,16),mat,parent,x,y,z);m.scale.set(sx,sy,sz);return m;}
  function limb(parent,mat,a,b,r1,r2){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);const obj=mesh(new THREE.CylinderGeometry(r2,r1,d.length(),12),mat,parent);obj.position.copy(start.add(end).multiplyScalar(.5));obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return obj;}
  const princess=new THREE.Group();scene.add(princess);princess.position.set(0,-1,0);princess.scale.setScalar(.85);
  const skirt=mesh(new THREE.ConeGeometry(1.8,2.5,48,1,true),lightLeaf,princess,0,1.3,0);
  // Layered, sculpted petals form a water-lily ball gown.
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const petal=sphere(princess,i%2?leaf:darkLeaf,Math.sin(a)*.82,1.45,Math.cos(a)*.82,.62,1.35,.24);petal.rotation.set(Math.cos(a)*.38,a,-Math.sin(a)*.38);}
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const p=sphere(princess,lightLeaf,Math.sin(a)*.48,2.05,Math.cos(a)*.48,.36,.82,.16);p.rotation.set(Math.cos(a)*.55,a,-Math.sin(a)*.55);}
  mesh(new THREE.CylinderGeometry(.32,.5,.9,24),leaf,princess,0,2.9,0);
  sphere(princess,skin,0,3.38,0,.4,.22,.23);mesh(new THREE.CylinderGeometry(.12,.15,.28,16),skin,princess,0,3.65,0);
  sphere(princess,skin,0,4.02,0,.34,.45,.3);sphere(princess,hair,0,4.23,-.08,.35,.3,.29);sphere(princess,hair,0,4.55,-.12,.25,.24,.24);
  sphere(princess,hair,-.19,4.22,.15,.18,.2,.17);
  for(const x of [-.13,.13])sphere(princess,hair,x,4.05,.28,.025,.038,.015);
  const smile=mesh(new THREE.TorusGeometry(.065,.012,8,16,Math.PI),material('#743e37'),princess,0,3.9,.29);smile.rotation.z=Math.PI;
  for(const x of [-.35,.35])sphere(princess,gold,x,3.94,0,.035,.08,.035);
  for(let i=0;i<5;i++){const a=(i-2)*.27;const jewel=mesh(new THREE.ConeGeometry(.06,.22+(.12-Math.abs(i-2)*.04),4),gold,princess,Math.sin(a)*.3,4.48,Math.cos(a)*.24);jewel.rotation.z=-a;}
  const arms=new THREE.Group();princess.add(arms);limb(arms,skin,[-.36,3.35,0],[-.83,3.04,.06],.12,.09);limb(arms,lightLeaf,[-.83,3.04,.06],[-1.25,3.47,.2],.09,.075);sphere(arms,skin,-1.28,3.54,.2,.09,.15,.09);limb(arms,skin,[.36,3.35,0],[.87,3.5,.03],.12,.09);limb(arms,lightLeaf,[.87,3.5,.03],[1.14,4.02,.1],.09,.065);sphere(arms,skin,1.16,4.1,.1,.08,.14,.08);
  const flower=new THREE.Group();princess.add(flower);flower.position.set(0,2.57,.47);for(let i=0;i<5;i++){let a=i*Math.PI*2/5;const p=sphere(flower,lightLeaf,Math.sin(a)*.12,Math.cos(a)*.12,0,.09,.15,.05);p.rotation.z=-a;}sphere(flower,gold,0,0,.05,.07,.07,.04);
  const water=mesh(new THREE.PlaneGeometry(100,100,30,30),new THREE.MeshStandardMaterial({color:'#102f26',roughness:.3,metalness:.6,transparent:true,opacity:.9}),scene,0,-1.1,0);water.rotation.x=-Math.PI/2;
  const platform=mesh(new THREE.CylinderGeometry(2.7,2.8,.09,64),material('#365d39',.5),scene,0,-1.03,0);
  for(let i=0;i<4;i++){const ring=mesh(new THREE.TorusGeometry(3+i*.7,.012,6,100),new THREE.MeshBasicMaterial({color:'#859e5d',transparent:true,opacity:.18-i*.025}),scene,0,-1.04,0);ring.rotation.x=Math.PI/2;}
  let seed=8;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  for(let i=0;i<45;i++){let x=(random()-.5)*30,z=(random()-.5)*22;if(Math.abs(x)<3&&Math.abs(z)<3)continue;const pad=mesh(new THREE.CylinderGeometry(.4+random()*.6,.4+random()*.6,.035,24,1,false,.2,5.9),material(i%2?'#315638':'#476044'),scene,x,-1.02,z);pad.rotation.y=random()*6;if(i%3===0){for(let k=0;k<5;k++){let a=k*6.28/5;let petal=sphere(scene,lightLeaf,x+Math.sin(a)*.14,-.9,z+Math.cos(a)*.14,.08,.18,.08);petal.rotation.z=Math.sin(a)*.55;}sphere(scene,gold,x,-.85,z,.07,.08,.07);}}
  for(let i=0;i<18;i++){const side=i%2?-1:1;let x=side*(6+random()*12),z=-4-random()*15;limb(scene,bark,[x,-1,z],[x+side*.8,12,z],.5+random()*.4,.2);for(let j=0;j<3;j++){const y=5+j*2;limb(scene,bark,[x,y,z],[x-side*(2+random()*3),y+2,z+.5],.2,.06);const vine=mesh(new THREE.CylinderGeometry(.03,.015,2+random()*3,6),material('#3d5940'),scene,x-side*(1+random()*3),y,z+.5);}}
  const moon=mesh(new THREE.SphereGeometry(.7,32,16),new THREE.MeshBasicMaterial({color:'#d8e4b3'}),scene,-6,7,-15);
  const count=innerWidth<760?250:550;const positions=new Float32Array(count*3);const origins=[];for(let i=0;i<count;i++){const p=[(random()-.5)*25,random()*10-1,(random()-.5)*20];origins.push(p);positions.set(p,i*3);}const dotsGeo=new THREE.BufferGeometry();dotsGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const dotCanvas=document.createElement('canvas');dotCanvas.width=32;dotCanvas.height=32;const ctx=dotCanvas.getContext('2d');const grad=ctx.createRadialGradient(16,16,0,16,16,16);grad.addColorStop(0,'#ffffdc');grad.addColorStop(.2,'#e9f6a5');grad.addColorStop(1,'#cbe37d00');ctx.fillStyle=grad;ctx.fillRect(0,0,32,32);const glow=new THREE.CanvasTexture(dotCanvas);
  const dots=new THREE.Points(dotsGeo,new THREE.PointsMaterial({size:.12,map:glow,color:'#e2ed9b',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(dots);
  const trailCount=200,trailPositions=new Float32Array(trailCount*3);const trailGeo=new THREE.BufferGeometry();trailGeo.setAttribute('position',new THREE.BufferAttribute(trailPositions,3));const trail=new THREE.Points(trailGeo,new THREE.PointsMaterial({map:glow,size:.1,color:'#eef0b1',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(trail);
  const state={progress:0};let anim,visible=true;const mobile=()=>innerWidth<760;
  const timeline=gsap.context(()=>{if(!reduced){gsap.to(state,{progress:1,ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:1.5}});gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{y:32,opacity:0,duration:1,scrollTrigger:{trigger:el,start:'top 92%',once:true}}));}});
  function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}listen(window,'resize',resize);listen(document,'visibilitychange',()=>{visible=!document.hidden;});
  const clock=new THREE.Clock();function render(){anim=requestAnimationFrame(render);if(!visible)return;const t=reduced?0:clock.getElapsedTime(),p=state.progress;const phase=Math.min(1,p*3.4);princess.position.x=mobile()?Math.sin(p*8)*.5:Math.sin(phase*Math.PI)*3.1;princess.position.y=-1+Math.sin(t*1.2)*.055;princess.rotation.y=reduced?-.2:p*Math.PI*9+Math.sin(t*.45)*.12;princess.rotation.z=Math.sin(t*.8)*.025;arms.rotation.z=Math.sin(t)*.035;camera.position.set(Math.sin(p*5)*1.2,3.7+p*1.5,mobile()?18:15-p*1.5);camera.lookAt(princess.position.x*.3,mobile()?3.3:3.5,0);for(let i=0;i<count;i++){positions[i*3]=origins[i][0]+Math.sin(t*.25+i)*.25;positions[i*3+1]=origins[i][1]+Math.sin(t*.45+i)*.18;}dotsGeo.attributes.position.needsUpdate=true;for(let i=0;i<trailCount;i++){let f=i/trailCount,a=f*18-t*.65-princess.rotation.y,r=1.2+f*2;trailPositions[i*3]=princess.position.x+Math.sin(a)*r;trailPositions[i*3+1]=.2+f*2+Math.sin(t+i)*.04;trailPositions[i*3+2]=Math.cos(a)*r;}trailGeo.attributes.position.needsUpdate=true;host.style.opacity=String(p>.36?Math.max(.16,1-(p-.36)*3):1);renderer.render(scene,camera);}render();
  return()=>{cancelAnimationFrame(anim);clearInterval(interval);timeline.revert();removers.forEach(fn=>fn());scene.traverse(obj=>{obj.geometry?.dispose();if(obj.material){(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>m.dispose());}});glow.dispose();renderer.dispose();renderer.domElement.remove();};
}


