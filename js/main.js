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
  const mobileScene = hero.querySelector('.artHero__mobileScene');
  const copy = hero.querySelector('.artHero__copy');
  const textOne = hero.querySelector('.artHero__text--one');
  const textTwo = hero.querySelector('.artHero__text--two');
  const textThree = hero.querySelector('.artHero__text--three');
  const scrollHint = hero.querySelector('.artHero__scroll');
  const next = hero.querySelector('.artHero__next');

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  function smoothstep(edge0, edge1, x){
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function viewportHeight(){
    return Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
  }

  function settings(){
    const w = window.innerWidth;
    if (w <= 640) {
      return {
        mode: 'mobile',
        height: 10.8,
        maxScale: 4.85,
        tunnelBoost: 2.15,
        sceneY: 160,
        sceneX: -12,
        treeX: 0,
        treeY: 10,
        treeScale: 1.16,
        shellX: -18,
        shellY: 160,
        shellScale: 1.34,
        drift: 34,
        smoothing: .34
      };
    }
    if (w <= 900) {
      return {
        mode: 'tablet',
        height: 7.0,
        maxScale: 3.15,
        tunnelBoost: 1.5,
        sceneY: 112,
        sceneX: -8,
        treeX: -24,
        treeY: 24,
        treeScale: 1.32,
        shellX: -10,
        shellY: 120,
        shellScale: 1.25,
        drift: 54,
        smoothing: .26
      };
    }
    return {
      mode: 'desktop',
      height: 7.2,
      maxScale: 5.4,
      tunnelBoost: 3.6,
      sceneY: 330,
      sceneX: 0,
      treeX: 0,
      treeY: 92,
      treeScale: 1.9,
      shellX: -28,
      shellY: 210,
      shellScale: 1.55,
      drift: 98,
      smoothing: .22
    };
  }

  let cfg = settings();
  let vh = viewportHeight();
  let target = 0;
  let current = 0;
  let raf = null;
  let resizeTimer = null;
  let stableW = window.innerWidth;

  function setHeroHeight(){
    cfg = settings();
    vh = viewportHeight();
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

    const zoom = isMobile ? smoothstep(.04, .90, p) : smoothstep(.04, .90, p);
    const deep = isMobile ? Math.pow(zoom, 1.04) : Math.pow(zoom, 1.12);
    const tunnel = isMobile ? smoothstep(.70, .985, p) : smoothstep(.72, .965, p);
    const tunnelSoft = tunnel * tunnel * (3 - 2 * tunnel);

    const scale = 1 + deep * (cfg.maxScale - 1) + tunnelSoft * cfg.tunnelBoost;
    const y = -deep * cfg.sceneY - tunnelSoft * (isMobile ? 132 : 150);
    const sceneX = cfg.sceneX + (!isMobile ? tunnelSoft * -8 : 0);

    const baseOut = 1 - smoothstep(.08, .30, p);
    const copyOut = smoothstep(.04, .18, p);
    const shellOut = isMobile ? smoothstep(.46, .84, p) : smoothstep(.36, .66, p);
    const treeOut = isMobile ? smoothstep(.84, .99, p) : smoothstep(.80, .99, p);
    const sceneFade = 1 - smoothstep(isMobile ? .88 : .84, .995, p);
    const wash = smoothstep(isMobile ? .90 : .86, .995, p);
    const nextIn = isMobile ? smoothstep(.88, .995, p) : smoothstep(.84, .985, p);

    if (isMobile && mobileScene) {
      setTransform(mobileScene, `translate3d(calc(-50% + ${sceneX}px), calc(-50% + ${y}px), 0) scale(${scale})`);
      setOpacity(mobileScene, sceneFade);
      setOpacity(base, 0);
      setOpacity(sea, 0);
      setOpacity(shell, 0);
      setOpacity(trees, 0);
    } else {
      setTransform(base, `translate3d(calc(-50% + ${sceneX}px), calc(-50% + ${y}px), 0) scale(${scale})`);
      setTransform(sea, `translate3d(calc(-50% + ${sceneX}px), calc(-50% + ${y}px), 0) scale(${scale})`);
      setTransform(trees, `translate3d(calc(-50% + ${cfg.treeX + deep * -8}px), calc(-50% - ${deep * cfg.treeY}px), 0) scale(${1 + deep * (cfg.treeScale - 1)})`);
      setTransform(shell, `translate3d(calc(-50% + ${cfg.shellX}px), calc(-50% - ${deep * cfg.shellY}px), 0) rotate(${deep * 12}deg) scale(${1 + deep * (cfg.shellScale - 1)})`);
      setOpacity(base, baseOut * sceneFade);
      setOpacity(sea, sceneFade);
      setOpacity(trees, (1 - treeOut * (isMobile ? .18 : .42)) * sceneFade);
      setOpacity(shell, (1 - shellOut) * sceneFade);
    }

    hero.style.setProperty('--wash-opacity', wash.toFixed(3));
    hero.style.setProperty('--cinematic-opacity', '0');

    setOpacity(copy, (1 - copyOut) * (1 - smoothstep(.46, .62, p)) * sceneFade);
    setTransform(copy, `translate3d(0, ${-30 * copyOut}px, 0)`);

    const one = smoothstep(.10, .20, p) * (1 - smoothstep(.30, .43, p));
    const two = smoothstep(.26, .39, p) * (1 - smoothstep(.56, .75, p));
    const three = smoothstep(.50, .65, p) * (1 - smoothstep(.76, .92, p));
    const drift = deep * cfg.drift;

    setOpacity(textOne, one * sceneFade);
    setOpacity(textTwo, two * sceneFade);
    setOpacity(textThree, three * sceneFade);
    setTransform(textOne, `translate3d(${drift * .18}px, ${-drift * .08}px, 0)`);
    setTransform(textTwo, `translate3d(${-drift * .12}px, ${-drift * .05}px, 0)`);
    setTransform(textThree, `translate3d(${drift * .10}px, ${-drift * .06}px, 0)`);
    setOpacity(scrollHint, 1 - smoothstep(.01, .08, p));

    if (next) {
      setOpacity(next, nextIn);
      setTransform(next, `translate3d(0, ${(1 - nextIn) * 34}px, 0) scale(${.985 + nextIn * .015})`);
      next.style.pointerEvents = nextIn > .98 ? 'auto' : 'none';
    }
  }

  function loop(){
    raf = null;
    readProgress();
    current += (target - current) * cfg.smoothing;
    if (Math.abs(target - current) < 0.0008) current = target;
    draw(current);
    if (Math.abs(target - current) > 0.0008) raf = requestAnimationFrame(loop);
  }

  function request(){
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function onResize(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nextW = window.innerWidth;
      const widthChanged = Math.abs(nextW - stableW) > 24;
      if (cfg.mode !== 'mobile' || widthChanged) {
        stableW = nextW;
        setHeroHeight();
      }
      request();
    }, 180);
  }

  if (reduce) {
    hero.style.height = 'auto';
    setOpacity(base, 0);
    setOpacity(sea, 0);
    setOpacity(shell, 0);
    setOpacity(trees, 0);
    setOpacity(mobileScene, 0);
    setOpacity(copy, 1);
    setOpacity(textOne, 0);
    setOpacity(textTwo, 0);
    setOpacity(textThree, 0);
    setOpacity(scrollHint, 0);
    setOpacity(next, 1);
    return;
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
  const steps = [...document.querySelectorAll('.caseStep')];
  if (!steps.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  let ticking = false;

  function enabled(){
    return !reduce && window.innerWidth > 760;
  }

  function stickyTop(){
    return window.innerWidth <= 900 ? 28 : 128;
  }

  function windowHeight(){
    const top = stickyTop();
    return window.innerWidth <= 900
      ? Math.min(Math.max(460, window.innerHeight - top - 64), 680)
      : Math.min(Math.max(560, window.innerHeight - top - 92), 820);
  }

  function prepare(){
    steps.forEach(step => {
      const inner = step.querySelector('.caseStep__inner');
      const media = step.querySelector('.caseStep__media');
      const text = step.querySelector('.caseStep__text');
      const img = media && media.querySelector('img');
      if (!inner || !media || !img) return;

      step.classList.remove('is-pannable');
      step.style.removeProperty('--pan-window');
      step.style.removeProperty('--pan-extra');
      step.style.removeProperty('--sticky-top');
      img.style.setProperty('--img-y', '0px');

      if (!enabled()) return;

      const mediaWidth = media.clientWidth || inner.clientWidth;
      const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.45;
      const renderedHeight = mediaWidth / ratio;
      const winH = windowHeight();
      const extra = Math.max(0, renderedHeight - winH);

      if (extra > 42) {
        step.classList.add('is-pannable');
        step.style.setProperty('--pan-window', `${winH.toFixed(2)}px`);
        step.style.setProperty('--pan-extra', `${extra.toFixed(2)}px`);
        step.style.setProperty('--sticky-top', `${stickyTop()}px`);
        if (text) text.style.setProperty('--sticky-top', `${stickyTop()}px`);
      }
    });
  }

  function render(){
    ticking = false;
    if (!enabled()) return;

    steps.forEach(step => {
      if (!step.classList.contains('is-pannable')) return;
      const img = step.querySelector('.caseStep__media img');
      if (!img) return;

      const extra = parseFloat(getComputedStyle(step).getPropertyValue('--pan-extra')) || 0;
      const top = parseFloat(getComputedStyle(step).getPropertyValue('--sticky-top')) || stickyTop();
      const rect = step.getBoundingClientRect();
      const progress = clamp((top - rect.top) / extra, 0, 1);
      img.style.setProperty('--img-y', `${(-extra * progress).toFixed(2)}px`);
    });
  }

  function request(){
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  function refresh(){
    prepare();
    render();
  }

  window.addEventListener('load', refresh);
  window.addEventListener('resize', refresh, { passive:true });
  window.addEventListener('scroll', request, { passive:true });

  steps.forEach(step => {
    const img = step.querySelector('.caseStep__media img');
    if (img && !img.complete) img.addEventListener('load', refresh, { once:true });
  });

  refresh();
})();
