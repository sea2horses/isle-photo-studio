(function(){
  // ---------- MINI CAROUSELS (service cards, e.g. Real Estate) ----------
  document.querySelectorAll('.service-card.mini-carousel').forEach(card=>{
    const slides = card.querySelectorAll('.mc-slide');
    if(slides.length < 2) return;
    let mIdx = 0;
    setInterval(()=>{
      slides[mIdx].classList.remove('active');
      mIdx = (mIdx + 1) % slides.length;
      slides[mIdx].classList.add('active');
    }, 2200);
  });

  // ---------- PROMO CAROUSEL ----------
  const promoTrack = document.getElementById('promoTrack');
  const promoPrev = document.getElementById('promoPrev');
  const promoNext = document.getElementById('promoNext');
  const PROMO_STEP = 206; // card width + gap
  function promoScrollNext(){
    const maxScroll = promoTrack.scrollWidth - promoTrack.clientWidth - 4;
    if(promoTrack.scrollLeft >= maxScroll){
      promoTrack.scrollTo({left:0, behavior:'smooth'});
    } else {
      promoTrack.scrollBy({left:PROMO_STEP, behavior:'smooth'});
    }
  }
  function promoScrollPrev(){
    promoTrack.scrollBy({left:-PROMO_STEP, behavior:'smooth'});
  }
  let promoTimer = setInterval(promoScrollNext, 2600);
  function resetPromoTimer(){
    clearInterval(promoTimer);
    promoTimer = setInterval(promoScrollNext, 2600);
  }
  promoNext.addEventListener('click', ()=>{ promoScrollNext(); resetPromoTimer(); });
  promoPrev.addEventListener('click', ()=>{ promoScrollPrev(); resetPromoTimer(); });
  promoTrack.addEventListener('mouseenter', ()=>clearInterval(promoTimer));
  promoTrack.addEventListener('mouseleave', resetPromoTimer);
  promoTrack.addEventListener('touchstart', ()=>clearInterval(promoTimer), {passive:true});
  promoTrack.addEventListener('touchend', resetPromoTimer);

  window.goToBooking = function(){
    const target = document.getElementById('booking');
    if(target){ target.scrollIntoView({behavior:'smooth', block:'start'}); }
  };

  // ---------- HERO CAROUSEL ----------
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDotsWrap = document.getElementById('heroDots');
  let heroIdx = 0;
  const HERO_INTERVAL = 1500;

  heroSlides.forEach((_, i)=>{
    const dot = document.createElement('button');
    if(i===0) dot.classList.add('active');
    dot.setAttribute('aria-label', 'Slide ' + (i+1));
    dot.addEventListener('click', ()=>{ goToHeroSlide(i); resetHeroTimer(); });
    heroDotsWrap.appendChild(dot);
  });
  const heroDots = heroDotsWrap.querySelectorAll('button');

  function goToHeroSlide(i){
    heroSlides[heroIdx].classList.remove('active');
    heroDots[heroIdx].classList.remove('active');
    heroIdx = i;
    heroSlides[heroIdx].classList.add('active');
    heroDots[heroIdx].classList.add('active');
  }
  function nextHeroSlide(){
    goToHeroSlide((heroIdx + 1) % heroSlides.length);
  }
  let heroTimer = setInterval(nextHeroSlide, HERO_INTERVAL);
  function resetHeroTimer(){
    clearInterval(heroTimer);
    heroTimer = setInterval(nextHeroSlide, HERO_INTERVAL);
  }
  const heroEl0 = document.querySelector('.hero');
  heroEl0.addEventListener('mouseenter', ()=>clearInterval(heroTimer));
  heroEl0.addEventListener('mouseleave', resetHeroTimer);

  // ---------- NAV SCROLL ----------
  const nav = document.getElementById('nav');
  window.addEventListener('scroll',()=>{
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ---------- HERO PARALLAX ----------
  const heroMedia = document.getElementById('heroMedia');
  const heroEl = document.querySelector('.hero');
  let ticking = false;
  function updateParallax(){
    const rect = heroEl.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1);
    heroMedia.style.transform = 'translateY(' + (progress * 60) + 'px)';
    ticking = false;
  }
  window.addEventListener('scroll', ()=>{
    if(!ticking){ requestAnimationFrame(updateParallax); ticking = true; }
  }, {passive:true});
  updateParallax();

  // ---------- LANGUAGE ----------
  let currentLang = 'en';
  const langButtons = document.querySelectorAll('.lang-toggle button');
  function applyLang(lang){
    currentLang = lang;
    document.documentElement.lang = lang;
    langButtons.forEach(b=>b.classList.toggle('active', b.dataset.lang===lang));
    document.querySelectorAll('[data-en]').forEach(el=>{
      const val = el.dataset[lang];
      if(val === undefined) return;
      if(el.tagName === 'OPTION' || el.tagName === 'BUTTON'){
        el.textContent = val;
      } else {
        el.innerHTML = val;
      }
    });
  }
  langButtons.forEach(b=>b.addEventListener('click', ()=>applyLang(b.dataset.lang)));

  // ---------- MOBILE MENU ----------
  const burger = document.getElementById('burger');
  const navLinks = document.querySelector('.nav-links');
  const navOverlay = document.getElementById('navOverlay');
  function openMenu(){
    navLinks.classList.add('open');
    navOverlay.classList.add('show');
    burger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu(){
    navLinks.classList.remove('open');
    navOverlay.classList.remove('show');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', ()=>{
    navLinks.classList.contains('open') ? closeMenu() : openMenu();
  });
  navOverlay.addEventListener('click', closeMenu);
  navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeMenu));
  window.addEventListener('resize', ()=>{
    if(window.innerWidth > 720) closeMenu();
  });

  // ---------- FILTERS ----------
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.service-card');
  chips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      chips.forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.dataset.filter;
      cards.forEach(card=>{
        const show = f==='all' || card.dataset.cat===f;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  // ---------- CARD EXPAND ----------
  cards.forEach(card=>{
    card.addEventListener('click', ()=>{
      const wasOpen = card.classList.contains('open');
      cards.forEach(c=>c.classList.remove('open'));
      if(!wasOpen) card.classList.add('open');
    });
  });

})();
