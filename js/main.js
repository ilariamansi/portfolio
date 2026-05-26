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

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  function smoothstep(edge0, edge1, x){
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function getViewportHeight(){
    // Usa un'altezza stabile: su Chrome mobile la barra URL cambia altezza e crea flash.
    return Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
  }

  function settings(){
    const w = window.innerWidth;
    if (w <= 640) {
      return {
        mode: 'mobile',
        height: 7.2,          // più strada = scroll più guidato, meno scena persa con uno swipe
        maxScale: 2.2,
        sceneY: 22,
        treeX: -72,
        treeY: 0,
        treeScale: 1.02,
        shellX: 0,
        shellY: 76,
        shellScale: 1.22,
        drift: 22
      };
    }
    if (w <= 900) {
      return {
        mode: 'tablet',
        height: 5.2,
        maxScale: 2.15,
        sceneY: 64,
        treeX: -34,
        treeY: 20,
        treeScale: 1.22,
        shellX: 0,
        shellY: 92,
        shellScale: 1.22,
        drift: 48
      };
    }
    return {
      mode: 'desktop',
      height: 4.8,
      maxScale: 3.35,
      sceneY: 116,
      treeX: 0,
      treeY: 88,
      treeScale: 1.95,
      shellX: 0,
      shellY: 126,
      shellScale: 1.55,
      drift: 96
    };
  }

  let cfg = settings();
  let vh = getViewportHeight();
  let target = 0;
  let current = 0;
  let raf = null;
  let resizeTimer = null;
  let stableW = window.innerWidth;

  function setHeroHeight(){
    cfg = settings();
    vh = getViewportHeight();
    hero.style.height = `${Math.round(vh * cfg.height)}px`;
  }

  function readProgress(){
    const rect = hero.getBoundingClientRect();
    const total = Math.max(1, hero.offsetHeight - vh);
    target = clamp(-rect.top / total, 0, 1);
  }

  function setTransform(el, value){
    if (el) el.style.transform = value;
  }

  function setOpacity(el, value){
    if (el) el.style.opacity = clamp(value, 0, 1).toFixed(3);
  }

  function draw(p){
    const isMobile = cfg.mode === 'mobile';

    // Su mobile la curva è più lunga e meno violenta: niente zoom aggressivo, niente rincorsa.
  const zoom = cfg.mode === 'mobile' ? smoothstep(.02, .82, p) : smoothstep(.05, .88, p);
    const deep = isMobile ? zoom : Math.pow(zoom, 1.16);
    const scale = 1 + deep * (cfg.maxScale - 1);
    const y = -deep * cfg.sceneY;

    const baseOut = 1 - smoothstep(.08, .30, p);
    const copyOut = smoothstep(.04, .18, p);
    const shellOut = isMobile ? smoothstep(.48, .82, p) : smoothstep(.40, .86, p);
    const treeOut = isMobile ? smoothstep(.88, 1, p) : smoothstep(.72, .98, p);

    setTransform(base, `translate3d(-50%, calc(-50% + ${y}px), 0) scale(${scale})`);
    setTransform(sea, `translate3d(-50%, calc(-50% + ${y}px), 0) scale(${scale})`);

    // Alberi mobile: quasi fermi, full-height e spostati a sinistra. Non devono sparire ai lati.
    setTransform(trees, `translate3d(calc(-50% + ${cfg.treeX + deep * -10}px), calc(-50% - ${deep * cfg.treeY}px), 0) scale(${1 + deep * (cfg.treeScale - 1)})`);

    // Conchiglia: resta protagonista all'inizio, poi sparisce davvero.
    setTransform(shell, `translate3d(calc(-50% + ${cfg.shellX}px), calc(-50% - ${deep * cfg.shellY}px), 0) rotate(${deep * 12}deg) scale(${1 + deep * (cfg.shellScale - 1)})`);

    setOpacity(base, baseOut);
    setOpacity(trees, isMobile ? 1 - treeOut * .18 : 1 - treeOut * .55);
    setOpacity(shell, 1 - shellOut);

    // Il flash bianco era causato dal wash mobile mentre la hero era ancora sticky.
    // Su mobile lo disattiviamo: il passaggio al paper lo fa la section successiva, non un overlay sopra la scena.
    hero.style.setProperty('--wash-opacity', isMobile ? '0' : smoothstep(.72, .98, p).toFixed(3));
    hero.style.setProperty('--cinematic-opacity', '0');

    setOpacity(copy, 1 - copyOut);
    setTransform(copy, `translate3d(0, ${-30 * copyOut}px, 0)`);

    const one = smoothstep(.10, .20, p) * (1 - smoothstep(.30, .43, p));
    const two = smoothstep(.26, .39, p) * (1 - smoothstep(.56, .75, p));
    const three = smoothstep(.50, .65, p) * (1 - smoothstep(.76, .92, p));
    const drift = deep * cfg.drift;

    setOpacity(textOne, one);
    setOpacity(textTwo, two);
    setOpacity(textThree, three);
    setTransform(textOne, `translate3d(${drift * .18}px, ${-drift * .08}px, 0)`);
    setTransform(textTwo, `translate3d(${-drift * .12}px, ${-drift * .05}px, 0)`);
    setTransform(textThree, `translate3d(${drift * .10}px, ${-drift * .06}px, 0)`);
    setOpacity(scrollHint, 1 - smoothstep(.01, .08, p));
  }

  function loop(){
    raf = null;
    readProgress();

    if (cfg.mode === 'mobile') {
      // No damping mobile: il damping rincorreva lo scroll e creava scatti/flash a fine sticky.
      current = target;
    } else {
      current += (target - current) * .18;
    }

    draw(current);
    if (cfg.mode !== 'mobile' && Math.abs(target - current) > 0.001) {
      raf = requestAnimationFrame(loop);
    }
  }

  function request(){
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function onResize(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nextW = window.innerWidth;
      const widthChanged = Math.abs(nextW - stableW) > 24;

      // Su mobile ignoriamo i micro-resize della barra URL: sono la causa dei flash.
      if (cfg.mode !== 'mobile' || widthChanged) {
        stableW = nextW;
        setHeroHeight();
      }
      request();
    }, 180);
  }

  setHeroHeight();
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
