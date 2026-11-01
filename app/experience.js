import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

export function initialize(config) {
  const removers=[];
  const listen=(el,event,fn)=>{el.addEventListener(event,fn);removers.push(()=>el.removeEventListener(event,fn));};
  gsap.registerPlugin(ScrollTrigger);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const host=document.getElementById('scene');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{host.dataset.fallback='true';return()=>{removers.forEach(fn=>fn());};}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;host.append(renderer.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#0b261f',.055);
  const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);camera.position.set(0,3.8,15);
  scene.add(new THREE.HemisphereLight(0xd7e8b3,0x193d30,2));const key=new THREE.DirectionalLight(0xffebbb,3);key.position.set(-4,8,5);scene.add(key);const rim=new THREE.PointLight(0xc5e590,45,20);rim.position.set(2,5,-3);scene.add(rim);
  const material=(color,roughness=.6,metalness=.05)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const leaf=material('#aabb73',.4),lightLeaf=material('#d3d99b',.45),gold=material('#d9ca79',.3,.65),bark=material('#17382c');
  function mesh(geo,mat,parent,x=0,y=0,z=0){const obj=new THREE.Mesh(geo,mat);obj.position.set(x,y,z);parent.add(obj);return obj;}
  function sphere(parent,mat,x,y,z,sx,sy,sz){const m=mesh(new THREE.SphereGeometry(1,24,16),mat,parent,x,y,z);m.scale.set(sx,sy,sz);return m;}
  function limb(parent,mat,a,b,r1,r2){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);const obj=mesh(new THREE.CylinderGeometry(r2,r1,d.length(),12),mat,parent);obj.position.copy(start.add(end).multiplyScalar(.5));obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return obj;}
  const princess=new THREE.Group();scene.add(princess);princess.position.set(0,-1,0);princess.scale.setScalar(.85);
  const dancerPose=new THREE.Group();princess.add(dancerPose);
  function poseDancingArms(object){
    const shoulderY=14.86,shoulderX=1.42,angle=.62;
    object.traverse(child=>{
      if(!child.isMesh||!child.geometry?.attributes?.position)return;
      const position=child.geometry.attributes.position;
      for(let i=0;i<position.count;i++){
        const x=position.getX(i),y=position.getY(i);
        if(y<13.65||y>16.1||Math.abs(x)<1.25)continue;
        const side=Math.sign(x),pivotX=side*shoulderX;
        const dx=x-pivotX,dy=y-shoulderY;
        const influence=THREE.MathUtils.smoothstep(Math.abs(x),1.25,2.15);
        const a=angle*influence,c=Math.cos(a),s=Math.sin(a);
        position.setXY(i,pivotX+dx*c-dy*s,shoulderY+dx*s+dy*c);
      }
      position.needsUpdate=true;
      child.geometry.computeVertexNormals();
      child.geometry.computeBoundingSphere();
    });
  }
  // The supplied game asset replaces the former geometric figure. Normalize it
  // to the same five-unit stage height so all scroll choreography stays reusable.
  const modelPath='/modelos/tiana/';
  new MTLLoader().setPath(modelPath).load('Tiana RIP.mtl',materials=>{
    materials.preload();
    new OBJLoader().setMaterials(materials).setPath(modelPath).load('Tiana RIP.obj',object=>{
      poseDancingArms(object);
      const box=new THREE.Box3().setFromObject(object),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
      object.position.set(-center.x,-box.min.y,-center.z);
      object.scale.setScalar(5/size.y);
      object.rotation.y=0;
      object.traverse(child=>{if(child.isMesh){child.castShadow=false;child.receiveShadow=false;child.frustumCulled=false;}});
      dancerPose.add(object);
    },undefined,()=>{host.dataset.modelFallback='true';});
  },undefined,()=>{host.dataset.modelFallback='true';});
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
  // Render the dancer separately so she can accompany the photos above the water.
  const dancerScene = new THREE.Scene();
  dancerScene.add(princess, trail);
  dancerScene.add(new THREE.HemisphereLight(0xeaf1cd, 0x244d36, 2.4));
  const dancerKey = key.clone(); dancerKey.intensity = 3.4; dancerScene.add(dancerKey);
  const dancerRim = rim.clone(); dancerScene.add(dancerRim);
  renderer.autoClear = false;
  const state = { scroll: reduced ? window.scrollY : 0 };
  const path = document.getElementById('timeline-path');
  const steps = [...document.querySelectorAll('.memory-step')];
  let pathTop = 0, pathEnd = 0, centers = [];
  let anim, visible = !document.hidden;
  const clamp = value => Math.min(1, Math.max(0, value));
  function measure() {
    pathTop = path.getBoundingClientRect().top + window.scrollY;
    pathEnd = pathTop + path.offsetHeight;
    centers = steps.map(step => step.getBoundingClientRect().top + window.scrollY + step.offsetHeight / 2);
  }
  measure();
  const timeline = gsap.context(() => {
    if (!reduced) {
      gsap.to(state, {scroll: () => document.documentElement.scrollHeight - innerHeight, ease:'none', scrollTrigger:{trigger:document.documentElement,start:'top top',end:'bottom bottom',scrub:0.7,invalidateOnRefresh:true}});
      gsap.utils.toArray('.reveal').forEach(el => gsap.from(el, {y:24,opacity:0,duration:0.8,scrollTrigger:{trigger:el,start:'top 94%',once:true}}));
      gsap.to('.timeline-fill', {scaleY:1, ease:'none', scrollTrigger:{trigger:path,start:'top center',end:'bottom center',scrub:true}});
    } else {
      listen(window, 'scroll', () => {state.scroll = window.scrollY;});
      gsap.set('.timeline-fill', {scaleY:1});
    }
  });
  ScrollTrigger.addEventListener('refresh', measure);
  removers.push(() => ScrollTrigger.removeEventListener('refresh', measure));
  document.fonts.ready.then(() => { if(host.isConnected) ScrollTrigger.refresh(); });
  function resize() { camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);measure(); }
  listen(window,'resize',resize);
  listen(document,'visibilitychange',()=>{visible=!document.hidden;});
  const ray=new THREE.Vector3(),anchor=new THREE.Vector3();
  const velocities=new Float32Array(trailCount*3),ages=new Float32Array(trailCount),colors=new Float32Array(trailCount*3);
  trailGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  trail.material.vertexColors=true;trail.material.needsUpdate=true;
  for(let i=0;i<trailCount;i++) ages[i]=random()*3;
  function spawnParticle(i) {
    const a=random()*Math.PI*2,r=(.8+random()*.9)*princess.scale.x;
    trailPositions[i*3]=princess.position.x+Math.sin(a)*r;
    trailPositions[i*3+1]=princess.position.y+(.4+random()*1.5)*princess.scale.y;
    trailPositions[i*3+2]=Math.cos(a)*r;
    velocities[i*3]=Math.sin(a)*(.12+random()*.25);
    velocities[i*3+1]=.12+random()*.35;
    velocities[i*3+2]=Math.cos(a)*.2;
  }
  let initializedParticles=false;
  const clock=new THREE.Clock();let elapsed=0;
  function render() {
    anim=requestAnimationFrame(render);
    const dt=Math.min(clock.getDelta(),.04);
    if(!visible)return;
    elapsed+=dt;
    const t=reduced?0:elapsed,scroll=state.scroll,mobile=innerWidth<760;
    const entry=clamp((scroll-(pathTop-innerHeight*.8))/(innerHeight*.8));
    const exit=clamp((pathEnd-scroll)/(innerHeight*.7));
    const mix=entry*exit;
    const viewCenter=scroll+innerHeight*.5;
    let chapter=0;
    for(let i=0;i<centers.length-1;i++) {
      if(viewCenter>=centers[i]) chapter=i+clamp((viewCenter-centers[i])/(centers[i+1]-centers[i]));
    }
    const xNorm=.5+Math.cos(chapter*Math.PI)*(mobile?.325:.265);
    const yNorm=.55+Math.sin(chapter*Math.PI*2)*.10;
    const cameraDrift = reduced ? 0 : Math.cos(chapter*Math.PI)*mix*.35;
    camera.position.set(cameraDrift,3.8+mix*.15,mobile?18:15);
    camera.lookAt(cameraDrift*.5,(mobile?3.3:3.5)+mix*.15,0);
    camera.updateMatrixWorld();
    ray.set(xNorm*2-1,1-yNorm*2,.5).unproject(camera).sub(camera.position).normalize();
    anchor.copy(camera.position).addScaledVector(ray,-camera.position.z/ray.z);
    const timelineScale=mobile?.30:.64;
    const scale=THREE.MathUtils.lerp(.85,timelineScale,mix);
    princess.scale.setScalar(scale);
    const storyShift=Math.sin(clamp(scroll/Math.max(1,pathTop-innerHeight))*Math.PI)*(mobile?.3:3.0);
    princess.position.x=THREE.MathUtils.lerp(storyShift,anchor.x,mix);
    princess.position.y=THREE.MathUtils.lerp(-1,anchor.y-2.3*scale,mix)+Math.sin(t*1.2)*.045;
    princess.rotation.y=reduced?-.2:chapter*Math.PI*2+scroll/innerHeight*.25+Math.sin(t*.5)*.14;
    princess.rotation.z=Math.sin(t*.8+chapter)*.035;
    dancerPose.rotation.x=Math.sin(t*1.25+chapter)*.018;
    dancerPose.rotation.z=Math.sin(t+chapter)*.045;
    for(let i=0;i<count;i++) {
      positions[i*3]=origins[i][0]+Math.sin(t*.25+i)*.25;
      positions[i*3+1]=origins[i][1]+Math.sin(t*.45+i)*.18;
    }
    dotsGeo.attributes.position.needsUpdate=true;
    for(let i=0;i<trailCount;i++) {
      ages[i]+=reduced?0:dt;
      if(!initializedParticles || ages[i]>3){ages[i]=!initializedParticles?random()*3:0;spawnParticle(i);}
      if(!reduced) for(let axis=0;axis<3;axis++) trailPositions[i*3+axis]+=velocities[i*3+axis]*dt;
      const fade=Math.sin(ages[i]/3*Math.PI);
      colors[i*3]=fade;colors[i*3+1]=fade;colors[i*3+2]=fade*.7;
    }
    initializedParticles=true;
    trailGeo.attributes.position.needsUpdate=true;trailGeo.attributes.color.needsUpdate=true;
    host.style.opacity=String(1-clamp((scroll-pathEnd)/(innerHeight*.7))*.82);
    renderer.clear();renderer.render(scene,camera);renderer.clearDepth();renderer.render(dancerScene,camera);
  }
  render();
  return()=>{
    cancelAnimationFrame(anim);timeline.revert();removers.forEach(fn=>fn());
    for(const root of [scene,dancerScene])root.traverse(obj=>{obj.geometry?.dispose();if(obj.material)(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>m.dispose());});
    glow.dispose();renderer.dispose();renderer.domElement.remove();
  };
}

