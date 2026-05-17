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

(function parallaxVisuals(){
  const items=[...document.querySelectorAll('[data-parallax-visual]')];
  if(!items.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let ticking=false;
  function clamp(n,min,max){return Math.min(Math.max(n,min),max)}
  function render(){
    ticking=false;
    const vh=window.innerHeight || 1;
    items.forEach(item=>{
      const rect=item.getBoundingClientRect();
      const speed=parseFloat(item.dataset.speed || '0.06');
      const center=rect.top + rect.height/2;
      const delta=(center - vh/2) * -speed;
      item.style.setProperty('--parallax-y', `${clamp(delta,-42,42).toFixed(2)}px`);
    });
  }
  function request(){if(!ticking){ticking=true;requestAnimationFrame(render)}}
  render();
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',request,{passive:true});
})();
