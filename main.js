/* =========================================================
   MAIN JS
   File: js/main.js
========================================================= */

(function mobileMenu(){
  const toggle = document.querySelector("#navToggle");
  const links = document.querySelectorAll(".navOverlay a");

  if(!toggle) return;

  function close(){
    toggle.checked = false;
  }

  links.forEach(link => link.addEventListener("click", close));

  window.addEventListener("keydown", event => {
    if(event.key === "Escape") close();
  });

  window.addEventListener("resize", () => {
    if(window.innerWidth > 900) close();
  }, { passive: true });
})();

(function artHero(){
  const hero = document.querySelector(".artHero");
  if(!hero) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce) return;

  function clamp(n, min, max){
    return Math.min(Math.max(n, min), max);
  }

  function smoothstep(edge0, edge1, x){
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  let ticking = false;

  function render(){
    ticking = false;

    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    const p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;

    const copyOut = smoothstep(0.05, 0.20, p);

    const textOne = smoothstep(0.18, 0.28, p) * (1 - smoothstep(0.38, 0.48, p));
    const textTwo = smoothstep(0.48, 0.60, p) * (1 - smoothstep(0.68, 0.80, p));
    const textThree = smoothstep(0.74, 0.84, p) * (1 - smoothstep(0.92, 0.98, p));

    const shellExit = smoothstep(0.54, 0.94, p);

    const sceneScale = 1 + p * 0.18;
    const sceneY = -p * 70;

    const shellScale = 0.72 + p * 0.16 + shellExit * 0.34;
    const shellY = -p * 84 - shellExit * 260;
    const shellRotate = shellExit * 55;
    const shellOpacity = 1 - smoothstep(0.78, 0.96, p);

    const treesScale = 1 + p * 0.035;
    const treesY = -p * 112;
    const treesOpacity = 1 - p * 0.22;

    const scrollOpacity = 1 - smoothstep(0.03, 0.12, p);

    hero.style.setProperty("--scene-scale", sceneScale.toFixed(3));
    hero.style.setProperty("--scene-y", `${sceneY.toFixed(2)}px`);
    hero.style.setProperty("--shell-scale", shellScale.toFixed(3));
    hero.style.setProperty("--shell-y", `${shellY.toFixed(2)}px`);
    hero.style.setProperty("--shell-rotate", `${shellRotate.toFixed(2)}deg`);
    hero.style.setProperty("--shell-opacity", shellOpacity.toFixed(3));
    hero.style.setProperty("--trees-scale", treesScale.toFixed(3));
    hero.style.setProperty("--trees-y", `${treesY.toFixed(2)}px`);
    hero.style.setProperty("--trees-opacity", treesOpacity.toFixed(3));
    hero.style.setProperty("--copy-opacity", (1 - copyOut).toFixed(3));
    hero.style.setProperty("--copy-y", `${(-34 * copyOut).toFixed(2)}px`);
    hero.style.setProperty("--text-one", textOne.toFixed(3));
    hero.style.setProperty("--text-two", textTwo.toFixed(3));
    hero.style.setProperty("--text-three", textThree.toFixed(3));
    hero.style.setProperty("--scroll-opacity", scrollOpacity.toFixed(3));
  }

  function requestRender(){
    if(!ticking){
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  render();
  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender, { passive: true });
})();

(function revealBlocks(){
  const items = document.querySelectorAll(".revealBlock, [data-parallax-text]");
  if(!items.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
      }
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -8% 0px"
  });

  items.forEach(item => observer.observe(item));
})();
