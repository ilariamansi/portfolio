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

    // Ricostruzione progressiva del quadro: prima acqua/paesaggio, poi alberi, infine conchiglia.
    const seaOpacity=.22 + smoothstep(.03,.24,p)*.78;
    const treesOpacity=.08 + smoothstep(.16,.42,p)*.92;
    const shellIn=smoothstep(.30,.52,p);
    const shellOut=smoothstep(.82,.98,p);
    const shellOpacity=shellIn*(1-shellOut);

    const copyOut=smoothstep(.06,.20,p);
    const textOne=smoothstep(.18,.30,p)*(1-smoothstep(.38,.50,p));
    const textTwo=smoothstep(.46,.58,p)*(1-smoothstep(.64,.76,p));
    const textThree=smoothstep(.72,.82,p)*(1-smoothstep(.92,.99,p));

    const sceneScale=1 + p*.045;
const sceneY=-p*18;
const shellScale=.72 + shellIn*.10 + p*.018 + shellOut*.05;
const shellY=90 - shellIn*76 - p*18 - shellOut*120;
    const shellRotate=shellOut*10;
    const treesScale=1 + p*.045;
    const treesY=0 - p*42;
    const scrollOpacity=1-smoothstep(.03,.12,p);

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
