(function mobileMenu(){
  const toggle=document.querySelector('#navToggle');
  const links=document.querySelectorAll('.navOverlay a');
  if(!toggle)return;
  function close(){toggle.checked=false}
  links.forEach(link=>link.addEventListener('click',close));
  window.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
  window.addEventListener('resize',()=>{if(window.innerWidth>900)close()},{passive:true});
})();

(function navContrast(){
  const nav=document.querySelector('.nav');
  const hero=document.querySelector('.artHero');
  if(!nav || !hero)return;
  let ticking=false;
  function render(){
    ticking=false;
    const rect=hero.getBoundingClientRect();
    const overHero=rect.bottom>24 && rect.top<window.innerHeight*.55;
    nav.classList.toggle('is-over-hero', overHero);
  }
  function request(){
    if(!ticking){
      ticking=true;
      requestAnimationFrame(render);
    }
  }
  render();
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',request,{passive:true});
})();


(function artHero(){
  const hero=document.querySelector('.artHero');
  if(!hero)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    hero.style.setProperty('--base-opacity','1');
    hero.style.setProperty('--sea-opacity','1');
    hero.style.setProperty('--shell-opacity','1');
    hero.style.setProperty('--trees-opacity','1');
    hero.style.setProperty('--wash-opacity','0');
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

    // v10: apertura come quadro intero, poi ingresso continuo nel mare.
    const baseOpacity=1-smoothstep(.06,.24,p);
    const washOpacity=smoothstep(.78,.98,p);

    const copyOut=smoothstep(.04,.16,p);
    const textOne=smoothstep(.10,.18,p)*(1-smoothstep(.30,.42,p));
    const textTwo=smoothstep(.25,.38,p)*(1-smoothstep(.55,.70,p));
    const textThree=smoothstep(.50,.64,p)*(1-smoothstep(.75,.92,p));

    const zoomStart=smoothstep(.03,.18,p)*.42;
    const zoomDeep=Math.pow(p,1.62)*5.9;
    const sceneScale=1 + zoomStart + zoomDeep;
    const sceneY=-p*178;

    const shellOut=smoothstep(.30,.62,p);
    const shellScale=1 + zoomStart*.55 + Math.pow(p,1.28)*.92;
    const shellY=-p*92 - shellOut*210;
    const shellRotate=p*38 + shellOut*22;
    const shellOpacity=1-smoothstep(.43,.70,p);

    const treesScale=1 + zoomStart*.38 + Math.pow(p,1.45)*2.15;
    const treesY=-p*190;
    const treesOpacity=1-smoothstep(.54,.84,p)*.88;

    const seaOpacity=1;
    const textScale=1 + zoomStart*.22 + p*.24;
    const textDrift=p*128;
    const scrollOpacity=1-smoothstep(.02,.10,p);

    hero.style.setProperty('--base-opacity',baseOpacity.toFixed(3));
    hero.style.setProperty('--wash-opacity',washOpacity.toFixed(3));
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
    hero.style.setProperty('--copy-y',`${(-58*copyOut).toFixed(2)}px`);
    hero.style.setProperty('--text-one',textOne.toFixed(3));
    hero.style.setProperty('--text-two',textTwo.toFixed(3));
    hero.style.setProperty('--text-three',textThree.toFixed(3));
    hero.style.setProperty('--text-scale',textScale.toFixed(3));
    hero.style.setProperty('--text-drift',`${textDrift.toFixed(2)}px`);
    hero.style.setProperty('--scroll-opacity',scrollOpacity.toFixed(3));
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


(function caseStudyMedia(){
  const steps=[...document.querySelectorAll('.caseStep')];
  if(!steps.length)return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking=false;

  function clamp(n,min,max){return Math.min(Math.max(n,min),max)}
  function stickyTop(){return window.innerWidth<=900 ? 0 : 128}
  function panWindowHeight(){
    // Finestra grande ma non più alta del viewport: resta leggibile accanto al testo.
    return Math.min(Math.max(560, window.innerHeight - stickyTop() - 92), 820);
  }

  function getRenderedHeight(img, mediaWidth){
    const ratio=(img.naturalWidth && img.naturalHeight) ? img.naturalWidth/img.naturalHeight : 1.6;
    return mediaWidth / ratio;
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
      const renderedH=getRenderedHeight(img, mediaWidth);
      const extra=Math.max(0, renderedH - windowH);

      // Solo immagini realmente più alte della finestra scorrono.
      if(extra > 36){
        step.classList.add('is-pannable');
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

      const media=step.querySelector('.caseStep__media');
      const img=media && media.querySelector('img');
      if(!media || !img)return;

      const rect=step.getBoundingClientRect();
      const extra=parseFloat(getComputedStyle(step).getPropertyValue('--pan-extra')) || 0;
      if(extra<=0)return;

      // Progress parte quando la sezione arriva sotto la nav/sticky top:
      // all'inizio vedi la parte alta dell'immagine, poi scorre SOLO l'immagine.
      const start=stickyTop();
      const progress=clamp((start - rect.top) / extra, 0, 1);
      const move=-extra * progress;

      img.style.setProperty('--img-y', `${move.toFixed(2)}px`);
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
