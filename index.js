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

  window.goToBooking = function(serviceValue){
    const serviceSelect = document.getElementById('fService');
    if(serviceSelect && serviceValue){ serviceSelect.value = serviceValue; }
    const target = document.getElementById('booking');
    if(target){ target.scrollIntoView({behavior:'smooth', block:'start'}); }
  };

  // ---------- HERO CAROUSEL ----------
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDotsWrap = document.getElementById('heroDots');
  let heroIdx = 0;
  const HERO_INTERVAL = 5000;

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
    renderCalendar();
    updateSummary();
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

  // ---------- BOOKING CALENDAR ----------
  const calTitle = document.getElementById('calTitle');
  const calGrid = document.getElementById('calGrid');
  const calPrev = document.getElementById('calPrev');
  const calNext = document.getElementById('calNext');
  const summaryEl = document.getElementById('selectedSummary');
  const monthNames = {
    en:['January','February','March','April','May','June','July','August','September','October','November','December'],
    es:['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  };
  const dowNames = {en:['S','M','T','W','T','F','S'], es:['D','L','M','X','J','V','S']};
  const today = new Date();
  today.setHours(0,0,0,0);
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = null;
  let selectedSlot = null;

  function updateSummary(){
    if(!selectedDate){ summaryEl.textContent = ''; return; }
    const locale = currentLang === 'es' ? 'es-ES' : 'en-US';
    const date = selectedDate.toLocaleDateString(locale, {weekday:'long', year:'numeric', month:'long', day:'numeric'});
    const prefix = currentLang === 'es' ? 'Seleccionado: ' : 'Selected: ';
    summaryEl.textContent = prefix + date + (selectedSlot ? ' · ' + selectedSlot : '');
  }

  function renderCalendar(){
    calTitle.textContent = monthNames[currentLang][viewMonth] + ' ' + viewYear;
    calGrid.innerHTML = '';
    dowNames[currentLang].forEach(day=>{
      const heading = document.createElement('div');
      heading.className = 'dow';
      heading.textContent = day;
      calGrid.appendChild(heading);
    });
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    for(let i = 0; i < firstDay; i++){
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      calGrid.appendChild(empty);
    }
    for(let day = 1; day <= daysInMonth; day++){
      const cellDate = new Date(viewYear, viewMonth, day);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cal-day';
      cell.textContent = day;
      const unavailable = cellDate < today || cellDate.getDay() === 0;
      if(unavailable){
        cell.classList.add('disabled');
        cell.disabled = true;
      }
      if(cellDate.getTime() === today.getTime()) cell.classList.add('today');
      if(selectedDate && cellDate.getTime() === selectedDate.getTime()) cell.classList.add('selected');
      if(!unavailable){
        cell.addEventListener('click', ()=>{
          selectedDate = cellDate;
          renderCalendar();
          updateSummary();
        });
      }
      calGrid.appendChild(cell);
    }
  }

  calPrev.addEventListener('click', ()=>{
    viewMonth--;
    if(viewMonth < 0){ viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  calNext.addEventListener('click', ()=>{
    viewMonth++;
    if(viewMonth > 11){ viewMonth = 0; viewYear++; }
    renderCalendar();
  });
  document.querySelectorAll('.slot').forEach(button=>{
    button.addEventListener('click', ()=>{
      document.querySelectorAll('.slot').forEach(slot=>slot.classList.remove('active'));
      button.classList.add('active');
      selectedSlot = button.dataset.slot;
      updateSummary();
    });
  });
  renderCalendar();

  // ---------- BOOKING EMAIL ----------
  const bookingForm = document.getElementById('bookingForm');
  const successPanel = document.getElementById('successPanel');
  bookingForm.addEventListener('submit', event=>{
    event.preventDefault();
    if(!selectedDate){
      alert(currentLang === 'es' ? 'Por favor selecciona una fecha en el calendario.' : 'Please select a date on the calendar.');
      return;
    }
    const name = document.getElementById('fName').value.trim();
    const phone = document.getElementById('fPhone').value.trim();
    const email = document.getElementById('fEmail').value.trim();
    const service = document.getElementById('fService').value;
    const notes = document.getElementById('fMessage').value.trim();
    const date = selectedDate.toLocaleDateString('en-US', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
    const body = [
      "Hi Isle Photo Studio! I'd like to book a session.",
      '',
      'Name: ' + name,
      'Phone: ' + phone,
      'Email: ' + email,
      'Service: ' + service,
      'Preferred date: ' + date + (selectedSlot ? ' (' + selectedSlot + ')' : ''),
      notes ? 'Notes: ' + notes : null
    ].filter(line=>line !== null).join('\n');
    const subject = 'Booking request from ' + name + ' — ' + service;
    window.location.href = 'mailto:islephotostudio@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    bookingForm.style.display = 'none';
    successPanel.classList.add('show');
  });

})();
