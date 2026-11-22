'use client';
import {useEffect,useRef} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function IntroFrog(){
  const host=useRef(null);
  useEffect(()=>{
    let renderer;
    try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{return;}
    renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
    host.current.append(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-5,5,2.5,0,.1,100);
    camera.position.set(0,0,12);camera.lookAt(0,0,0);
    scene.add(new THREE.HemisphereLight(0xffffff,0x587251,2));
    const frog=new THREE.Group();scene.add(frog);
    let disposed=false,frame,elapsed=0,ready=false;
    const frogJoints=[];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const disposeModel=model=>model.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.map?.dispose();m.dispose();});});
    new GLTFLoader().load('/modelos/naveen.glb',gltf=>{
      if(disposed){disposeModel(gltf.scene);return;}
      const model=gltf.scene,box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
      model.position.sub(new THREE.Vector3(center.x,box.min.y,center.z));
      const normalized=new THREE.Group();normalized.add(model);normalized.scale.setScalar(1.25/Math.max(size.x,size.y,size.z));frog.add(normalized);
    ready=true;
    model.updateWorldMatrix(true,true);
    const bones={};
    model.traverse(node=>{if(node.isBone)bones[node.name]=node;});
    const leftHip=Object.values(bones).find(node=>/^e_hip_l_/.test(node.name));
    const rightHip=Object.values(bones).find(node=>/^e_hip_r_/.test(node.name));
    // Anatomical left/right defines the shared hinge direction in world space.
    // Convert it to each bone's own rest coordinates, including mirrored bones.
    const lateral=leftHip&&rightHip
      ? leftHip.getWorldPosition(new THREE.Vector3()).sub(rightHip.getWorldPosition(new THREE.Vector3())).normalize()
      : new THREE.Vector3(1,0,0);
    model.traverse(node=>{
      const match=node.name.match(/^e_(hip|knee|ankle|toes|shoulder|elbow|wrist|thumbfinger2|middlefinger2|spine1|chest|head|jaw)_([lrm])_/);
      if(node.isBone && match){
        const inverseRest=node.getWorldQuaternion(new THREE.Quaternion()).invert();
        frogJoints.push({node,rest:node.quaternion.clone(),kind:match[1],side:match[2]==='l'?1:-1,
          flexAxis:lateral.clone().applyQuaternion(inverseRest).normalize(),
          spreadAxis:new THREE.Vector3(0,1,0).applyQuaternion(inverseRest).normalize()});
      }
    });

    });
    function resize(){renderer.setSize(150,150);camera.left=-1.25;camera.right=1.25;camera.updateProjectionMatrix();}
    resize();window.addEventListener('resize',resize);
  const poseTimes=[0,.12,.18,.28,.52,.72,.82,.9,1];
  const poses={
    hip:[0,-.3,-.42,.55,.3,-.45,-.35,-.32,0],
    knee:[0,.42,.58,-1.05,-.3,.9,.65,.48,0],
    ankle:[0,-.2,-.32,.6,.15,-.5,-.35,-.3,0],
    toes:[0,.12,.2,-.28,-.15,.25,.2,.18,0],
    shoulder:[0,.18,.25,-.2,-.5,-.85,-.65,.2,0],
    elbow:[0,.28,.38,-.16,-.45,-.65,-.5,.42,0],
    wrist:[0,-.12,-.2,.15,-.1,-.4,-.25,.14,0],
    thumbfinger2:[0,0,.05,.1,.2,.35,.3,.12,0],
    middlefinger2:[0,0,.03,.08,.12,.22,.18,.08,0],
    spine1:[0,-.06,-.1,.12,.08,-.06,-.08,-.1,0],
    chest:[0,-.04,-.06,.08,.05,-.04,-.05,-.07,0],
    head:[-.06,.06,.08,-.08,-.04,.12,.1,.08,-.06],
    jaw:[0,0,0,0,0,0,0,0,0]
  };
  function samplePose(kind,progress){
    let i=0;while(i<poseTimes.length-2&&progress>poseTimes[i+1])i++;
    const u=THREE.MathUtils.smoothstep(progress,poseTimes[i],poseTimes[i+1]);
    return THREE.MathUtils.lerp(poses[kind][i],poses[kind][i+1],u);
  }

    const clock=new THREE.Clock();
    function render(){
      frame=requestAnimationFrame(render);
      const dt=clock.getDelta();
      if(document.hidden || !ready)return;
      elapsed+=Math.min(dt,.1);
      const hop=elapsed/1.1,step=Math.floor(hop),steps=7;
      const cycle=Math.floor(step/steps)%2,direction=cycle===0?1:-1;
      const phase=(elapsed%1.1)/1.1,flight=reduced?0:THREE.MathUtils.clamp((phase-.15)/.7,0,1);
      const progress=reduced?0:(cycle===0?(step%steps+flight)/steps:1-(step%steps+flight)/steps);
      host.current.style.transform=`translate3d(${Math.max(0,innerWidth-150)*progress}px,0,0)`;
      frog.position.set(0,.08+4*flight*(1-flight)*.65,0);
      frog.rotation.set(0,reduced?0:direction*Math.PI/2,0);
      const squash=reduced?0:Math.sin(phase*Math.PI*2)*.06;frog.scale.set(1,1-squash,1);
      for(const joint of frogJoints){
        joint.node.quaternion.copy(joint.rest);
        joint.node.rotateOnAxis(joint.flexAxis,samplePose(joint.kind,reduced?0:phase));
      }
      renderer.render(scene,camera);
    }
    render();return()=>{disposed=true;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);disposeModel(scene);renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <div ref={host} aria-hidden="true" style={{position:'fixed',bottom:0,left:0,width:150,height:150,willChange:'transform',pointerEvents:'none',zIndex:2}}/>;
}
