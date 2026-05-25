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

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function getMode() {
    const w = window.innerWidth;

    if (w <= 640) return 'mobile';
    if (w <= 900) return 'tablet';
    return 'desktop';
  }

  if (reduce) {
    hero.style.setProperty('--base-opacity', '1');
    hero.style.setProperty('--sea-opacity', '1');
    hero.style.setProperty('--shell-opacity', '1');
    hero.style.setProperty('--trees-opacity', '1');
    hero.style.setProperty('--wash-opacity', '0');
    return;
  }

  let ticking = false;

  function render() {
    ticking = false;

    const mode = getMode();
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    const p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;

    const isMobile = mode === 'mobile';
    const isTablet = mode === 'tablet';

    const baseOpacity = 1 - smoothstep(.08, .28, p);
    const washOpacity = smoothstep(.68, .96, p);

    const copyOut = smoothstep(.05, .18, p);

    const textOne = smoothstep(.12, .22, p) * (1 - smoothstep(.30, .44, p));
    const textTwo = smoothstep(.28, .42, p) * (1 - smoothstep(.54, .70, p));
    const textThree = smoothstep(.52, .66, p) * (1 - smoothstep(.76, .92, p));

    const zoomStart = smoothstep(.04, .20, p) * (isMobile ? .20 : isTablet ? .30 : .42);
    const zoomDeep = Math.pow(p, 1.55) * (isMobile ? 2.65 : isTablet ? 4.2 : 6.4);

    const sceneScale = 1 + zoomStart + zoomDeep;
    const sceneY = -p * (isMobile ? 72 : isTablet ? 120 : 178);

    const shellOut = smoothstep(.30, .62, p);
    const shellScale = 1 + zoomStart * .45 + Math.pow(p, 1.25) * (isMobile ? .34 : .72);
    const shellY = -p * (isMobile ? 42 : 92) - shellOut * (isMobile ? 72 : 210);
    const shellRotate = p * (isMobile ? 16 : 38) + shellOut * (isMobile ? 8 : 22);
    const shellOpacity = 1 - smoothstep(.46, .72, p);

    const treesScale = 1 + zoomStart * .22 + Math.pow(p, 1.35) * (isMobile ? .55 : isTablet ? 1.15 : 2.15);
    const treesY = -p * (isMobile ? 44 : isTablet ? 96 : 190);
    const treesOpacity = isMobile
      ? .82 - smoothstep(.58, .88, p) * .42
      : 1 - smoothstep(.54, .84, p) * .88;

    const textScale = 1 + zoomStart * .15 + p * (isMobile ? .08 : .24);
    const textDrift = p * (isMobile ? 52 : 154);
    const scrollOpacity = 1 - smoothstep(.01, .08, p);

    const cinematic = smoothstep(.58, .9, p);

    hero.style.setProperty('--base-opacity', baseOpacity.toFixed(3));
    hero.style.setProperty('--wash-opacity', washOpacity.toFixed(3));

    hero.style.setProperty('--scene-scale', sceneScale.toFixed(3));
    hero.style.setProperty('--scene-y', `${sceneY.toFixed(2)}px`);

    hero.style.setProperty('--sea-opacity', '1');

    hero.style.setProperty('--shell-scale', shellScale.toFixed(3));
    hero.style.setProperty('--shell-y', `${shellY.toFixed(2)}px`);
    hero.style.setProperty('--shell-rotate', `${shellRotate.toFixed(2)}deg`);
    hero.style.setProperty('--shell-opacity', shellOpacity.toFixed(3));

    hero.style.setProperty('--trees-scale', treesScale.toFixed(3));
    hero.style.setProperty('--trees-y', `${treesY.toFixed(2)}px`);
    hero.style.setProperty('--trees-opacity', treesOpacity.toFixed(3));

    hero.style.setProperty('--copy-opacity', (1 - copyOut).toFixed(3));
    hero.style.setProperty('--copy-y', `${(-42 * copyOut).toFixed(2)}px`);

    hero.style.setProperty('--text-one', textOne.toFixed(3));
    hero.style.setProperty('--text-two', textTwo.toFixed(3));
    hero.style.setProperty('--text-three', textThree.toFixed(3));
    hero.style.setProperty('--text-scale', textScale.toFixed(3));
    hero.style.setProperty('--text-drift', `${textDrift.toFixed(2)}px`);

    hero.style.setProperty('--scroll-opacity', scrollOpacity.toFixed(3));
    hero.style.setProperty('--cinematic-opacity', cinematic.toFixed(3));
  }

  function requestRender() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  render();

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
})();