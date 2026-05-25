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
  const hero = document.querySelector('.artHero');
  if (!hero) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const base = hero.querySelector('.artHero__base');
  const sea = hero.querySelector('.artHero__sea');
  const shell = hero.querySelector('.artHero__shell');
  const trees = hero.querySelector('.artHero__trees');
  const copy = hero.querySelector('.artHero__copy');
  const textOne = hero.querySelector('.artHero__text--one');
  const textTwo = hero.querySelector('.artHero__text--two');
  const textThree = hero.querySelector('.artHero__text--three');
  const scrollHint = hero.querySelector('.artHero__scroll');

  if (reduce) return;

  function clamp(n, min, max){
    return Math.min(Math.max(n, min), max);
  }

  function smoothstep(edge0, edge1, x){
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function settings(){
    const w = window.innerWidth;
    if (w <= 640) {
      return {
        mode: 'mobile',
        maxScale: 1.72,
        y: 28,
        treeScale: 1.10,
        treeY: 14,
        shellScale: 1.06,
        shellY: 22,
        drift: 22,
        height: 3.15
      };
    }
    if (w <= 900) {
      return {
        mode: 'tablet',
        maxScale: 2.65,
        y: 70,
        treeScale: 1.55,
        treeY: 46,
        shellScale: 1.32,
        shellY: 68,
        drift: 58,
        height: 3.8
      };
    }
    return {
      mode: 'desktop',
      maxScale: 3.45,
      y: 116,
      treeScale: 1.95,
      treeY: 88,
      shellScale: 1.55,
      shellY: 126,
      drift: 96,
      height: 4.8
    };
  }

  let cfg = settings();
  let target = 0;
  let current = 0;
  let raf = null;
  let stableW = window.innerWidth;
  let stableH = window.innerHeight;

  function setHeroHeight(){
    cfg = settings();
    hero.style.height = `${Math.round(stableH * cfg.height)}px`;
  }

  function readProgress(){
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - stableH;
    target = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
  }

  function setTransform(el, value){
    if (el) el.style.transform = value;
  }

  function setOpacity(el, value){
    if (el) el.style.opacity = value.toFixed(3);
  }

  function draw(p){
    const zoom = smoothstep(.05, .88, p);
    const deep = Math.pow(zoom, 1.18);
    const scale = 1 + deep * (cfg.maxScale - 1);
    const y = -deep * cfg.y;

    const baseOut = 1 - smoothstep(.08, .30, p);
    const wash = smoothstep(.68, .98, p);
    const copyOut = smoothstep(.04, .18, p);
    const shellOut = smoothstep(.38, .74, p);
    const treeOut = smoothstep(.60, .92, p);

    setTransform(base, `translate3d(-50%, calc(-50% + ${y}px), 0) scale(${scale})`);
    setTransform(sea, `translate3d(-50%, calc(-50% + ${y}px), 0) scale(${scale})`);
    setTransform(trees, `translate3d(-50%, calc(-50% - ${deep * cfg.treeY}px), 0) scale(${1 + deep * (cfg.treeScale - 1)})`);
    setTransform(shell, `translate3d(-50%, calc(-50% - ${deep * cfg.shellY}px), 0) rotate(${deep * 18}deg) scale(${1 + deep * (cfg.shellScale - 1)})`);

    setOpacity(base, baseOut);
    setOpacity(trees, cfg.mode === 'mobile' ? .88 - treeOut * .18 : 1 - treeOut * .55);
    setOpacity(shell, 1 - shellOut * .85);
    hero.style.setProperty('--wash-opacity', wash.toFixed(3));
    hero.style.setProperty('--cinematic-opacity', smoothstep(.62, .96, p).toFixed(3));

    setOpacity(copy, 1 - copyOut);
    setTransform(copy, `translate3d(0, ${-34 * copyOut}px, 0)`);

    const one = smoothstep(.10, .20, p) * (1 - smoothstep(.31, .44, p));
    const two = smoothstep(.26, .40, p) * (1 - smoothstep(.54, .70, p));
    const three = smoothstep(.50, .65, p) * (1 - smoothstep(.74, .90, p));
    const drift = deep * cfg.drift;

    setOpacity(textOne, one);
    setOpacity(textTwo, two);
    setOpacity(textThree, three);
    setTransform(textOne, `translate3d(${drift * .28}px, ${-drift * .10}px, 0)`);
    setTransform(textTwo, `translate3d(${-drift * .22}px, ${-drift * .08}px, 0)`);
    setTransform(textThree, `translate3d(${drift * .16}px, ${-drift * .10}px, 0)`);
    setOpacity(scrollHint, 1 - smoothstep(.01, .08, p));
  }

  function loop(){
    raf = null;
    readProgress();

    // Damping: evita lo scatto se il browser invia pochi eventi scroll.
    current += (target - current) * 0.16;
    draw(current);

    if (Math.abs(target - current) > 0.001) {
      raf = requestAnimationFrame(loop);
    } else {
      current = target;
      draw(current);
    }
  }

  function request(){
    if (!raf) raf = requestAnimationFrame(loop);
  }

  let resizeTimer;
  function onResize(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nextW = window.innerWidth;
      const nextH = window.innerHeight;

      // Su mobile la barra del browser cambia l'altezza durante lo scroll:
      // se aggiorniamo la scena a ogni micro-resize, compare il flash.
      const isMobile = nextW <= 640;
      const widthChanged = Math.abs(nextW - stableW) > 24;
      const heightChanged = Math.abs(nextH - stableH) > 120;

      if (!isMobile || widthChanged || heightChanged) {
        stableW = nextW;
        stableH = nextH;
        setHeroHeight();
      }

      readProgress();
      draw(target);
      request();
    }, 160);
  }

  setHeroHeight();
  readProgress();
  draw(0);

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
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
