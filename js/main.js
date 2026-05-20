(function mobileMenu(){
  const toggle=document.querySelector('#navToggle');
  const links=document.querySelectorAll('.navOverlay a');
  if(!toggle)return;
  function close(){toggle.checked=false}
  links.forEach(link=>link.addEventListener('click',close));
  window.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
  window.addEventListener('resize',()=>{if(window.innerWidth>900)close()},{passive:true});
})();

(function artHero(){
  const hero=document.querySelector('.artHero');
  if(!hero)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    hero.style.setProperty('--sea-opacity','1');
    hero.style.setProperty('--shell-opacity','1');
    hero.style.setProperty('--trees-opacity','1');
    return;
  }
  function clamp(n,min,max){return Math.min(Math.max(n,min),max)}
  function smoothstep(edge0,edge1,x){const t=clamp((x-edge0)/(edge1-edge0),0,1);return t*t*(3-2*t)}
  let ticking=false;
  function render(){
    ticking=false;
    const rect=hero.getBoundingClientRect();
    const total=hero.offsetHeight-window.innerHeight;
    const p=total>0?clamp(-rect.top/total,0,1):0;

    // Sequenza più leggibile: scena pulita > ricomposizione del quadro > ingresso nel mare.
    const build=smoothstep(.04,.46,p);
    const dive=smoothstep(.52,.96,p);
    const seaOpacity=.12 + smoothstep(.02,.28,p)*.88;
    const treesOpacity=.04 + smoothstep(.14,.38,p)*.96;
    const shellIn=smoothstep(.24,.44,p);
    const shellOpacity=shellIn;

    const copyOut=smoothstep(.05,.18,p);
    const textOne=smoothstep(.15,.27,p)*(1-smoothstep(.34,.46,p));
    const textTwo=smoothstep(.36,.50,p)*(1-smoothstep(.54,.66,p));
    const textThree=smoothstep(.58,.72,p)*(1-smoothstep(.84,.98,p));

    // Qui lo zoom diventa evidente: non è un semplice parallax, è proprio l'ingresso nella scena.
    const sceneScale=1 + build*.06 + dive*.54;
    const sceneY=-build*12 - dive*96;
    const shellScale=.62 + shellIn*.30 + dive*.46;
    const shellY=132 - shellIn*118 - dive*210;
    const shellRotate=build*-2 + dive*10;
    const treesScale=1 + build*.035 + dive*.42;
    const treesY=-build*26 - dive*118;
    const scrollOpacity=1-smoothstep(.03,.12,p);
    const immersiveScale=1 + dive*.18;
    const immersiveY=-dive*34;

    hero.style.setProperty('--scene-scale',sceneScale.toFixed(3));
    hero.style.setProperty('--scene-y',`${sceneY.toFixed(2)}px`);
    hero.style.setProperty('--sea-opacity',seaOpacity.toFixed(3));
    hero.style.setProperty('--shell-scale',shellScale.toFixed(3));
    hero.style.setProperty('--shell-y',`${shellY.toFixed(2)}px`);
    hero.style.setProperty('--shell-rotate',`${shellRotate.toFixed(2)}deg`);
    hero.style.setProperty('--shell-opacity',shellOpacity.toFixed(3));
    hero.style.setProperty('--trees-scale',treesScale.toFixed(3));
    hero.style.setProperty('--trees-y',`${treesY.toFixed(2)}px`);
    hero.style.setProperty('--trees-opacity',treesOpacity.toFixed(3));
    hero.style.setProperty('--copy-opacity',(1-copyOut).toFixed(3));
    hero.style.setProperty('--copy-y',`${(-30*copyOut).toFixed(2)}px`);
    hero.style.setProperty('--text-one',textOne.toFixed(3));
    hero.style.setProperty('--text-two',textTwo.toFixed(3));
    hero.style.setProperty('--text-three',textThree.toFixed(3));
    hero.style.setProperty('--immersive-scale',immersiveScale.toFixed(3));
    hero.style.setProperty('--immersive-y',`${immersiveY.toFixed(2)}px`);
    hero.style.setProperty('--scroll-opacity',scrollOpacity.toFixed(3));

    // Contrasto dinamico della navigazione: chiara sulla scena scura, scura sulle sezioni chiare.
    document.body.classList.toggle('nav-on-dark', rect.bottom > 0 && p > .22 && p < .98);
  }
  function requestRender(){if(!ticking){ticking=true;requestAnimationFrame(render)}}
  render();
  window.addEventListener('scroll',requestRender,{passive:true});
  window.addEventListener('resize',requestRender,{passive:true});
})();

(function revealBlocks(){
  const items=document.querySelectorAll('.revealBlock, [data-parallax-text]');
  if(!items.length)return;
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('is-visible')});
  },{threshold:.14,rootMargin:'0px 0px -8% 0px'});
  items.forEach(item=>observer.observe(item));
})();





(function homeProjectImages(){
  const images=[...document.querySelectorAll('.homeProject__image img')];
  if(!images.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let ticking=false;
  function clamp(n,min,max){return Math.min(Math.max(n,min),max)}
  function render(){
    ticking=false;
    if(window.innerWidth<=900){
      images.forEach(img=>img.style.setProperty('--home-img-y','0px'));
      return;
    }
    images.forEach(img=>{
      const rect=img.parentElement.getBoundingClientRect();
      if(rect.bottom<0 || rect.top>window.innerHeight)return;
      const progress=clamp((window.innerHeight-rect.top)/(window.innerHeight+rect.height),0,1);
      const move=(progress-.5)*-34;
      img.style.setProperty('--home-img-y',`${move.toFixed(2)}px`);
    });
  }
  function request(){if(!ticking){ticking=true;requestAnimationFrame(render)}}
  render();
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',request,{passive:true});
})();
(function caseStudyMedia(){
  const steps=[...document.querySelectorAll('.caseStep')];
  if(!steps.length)return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking=false;

  function clamp(n,min,max){return Math.min(Math.max(n,min),max)}
  function pinTop(){return window.innerWidth<=900 ? 0 : 126}
  function panWindowHeight(){
    return Math.min(Math.max(540, window.innerHeight - pinTop() - 86), 820);
  }
  function imageRatio(img){
    if(img.naturalWidth && img.naturalHeight) return img.naturalWidth / img.naturalHeight;
    const w=parseFloat(img.getAttribute('width'));
    const h=parseFloat(img.getAttribute('height'));
    return (w && h) ? w/h : 1.6;
  }
  function renderedHeight(img, width){
    return width / imageRatio(img);
  }

  function prepare(){
    steps.forEach(step=>{
      const media=step.querySelector('.caseStep__media');
      const img=media && media.querySelector('img');
      if(!media || !img)return;

      step.classList.remove('is-pannable');
      step.style.removeProperty('--pan-window');
      step.style.removeProperty('--pan-extra');
      img.style.setProperty('--img-y','0px');

      if(window.innerWidth<=900 || reduce)return;

      const mediaWidth=media.clientWidth;
      const windowH=panWindowHeight();
      const imgH=renderedHeight(img, mediaWidth);
      const extra=Math.max(0, imgH - windowH);

      // Attiva la finestra scorrevole SOLO quando l'immagine è davvero più alta della viewport.
      if(extra > 80){
        step.classList.add('is-pannable');
        step.style.setProperty('--pin-top', `${pinTop()}px`);
        step.style.setProperty('--pan-window', `${windowH.toFixed(2)}px`);
        step.style.setProperty('--pan-extra', `${extra.toFixed(2)}px`);
      }
    });
  }

  function render(){
    ticking=false;
    if(window.innerWidth<=900 || reduce)return;

    steps.forEach(step=>{
      if(!step.classList.contains('is-pannable'))return;
      const img=step.querySelector('.caseStep__media img');
      if(!img)return;

      const rect=step.getBoundingClientRect();
      const extra=parseFloat(getComputedStyle(step).getPropertyValue('--pan-extra')) || 0;
      if(extra<=0)return;

      // 0: sezione appena agganciata alla sticky area = parte alta dell'immagine.
      // 1: fine distanza extra = parte bassa dell'immagine. Non muove mai il blocco intero.
      const progress=clamp((pinTop() - rect.top) / extra, 0, 1);
      img.style.setProperty('--img-y', `${(-extra * progress).toFixed(2)}px`);
    });
  }

  function request(){
    if(!ticking){
      ticking=true;
      requestAnimationFrame(render);
    }
  }
  function refresh(){
    prepare();
    render();
  }

  window.addEventListener('load', refresh);
  window.addEventListener('resize', refresh, {passive:true});
  window.addEventListener('scroll', request, {passive:true});
  steps.forEach(step=>{
    const img=step.querySelector('.caseStep__media img');
    if(img && !img.complete) img.addEventListener('load', refresh, {once:true});
  });
  refresh();
})();
