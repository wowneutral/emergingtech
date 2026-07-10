(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* page enter fade */
  if(!reduce){
    document.body.classList.add('entering');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ document.body.classList.remove('entering'); }); });
  }

  /* scroll progress */
  var prog = document.getElementById('progress');
  if(prog){
    addEventListener('scroll', function(){
      var h = document.documentElement;
      prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100) + '%';
    }, {passive:true});
  }

  /* intro shutter (home) */
  var intro = document.getElementById('intro');
  if(intro){
    var seen = false;
    try{ seen = sessionStorage.getItem('et_intro') === '1'; }catch(e){}
    if(reduce || seen){ intro.remove(); }
    else{
      requestAnimationFrame(function(){ intro.classList.add('go'); });
      setTimeout(function(){ intro.classList.add('open'); try{ sessionStorage.setItem('et_intro','1'); }catch(e){} }, 300);
      setTimeout(function(){ intro.remove(); }, 2700);
    }
  }

  /* page-leave fade */
  if(!reduce){
    document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach(function(a){
      a.addEventListener('click', function(ev){
        if(ev.metaKey||ev.ctrlKey||ev.shiftKey||a.target==='_blank') return;
        ev.preventDefault();
        document.body.classList.add('leaving');
        setTimeout(function(){ location.href = a.getAttribute('href'); }, 240);
      });
    });
  }

  /* broken-image fallbacks */
  document.querySelectorAll('img').forEach(function(img){
    img.addEventListener('error', function(){
      img.classList.add('broken');
      var host = img.closest('.brandlink, .flogo, .seal, .hero-visual, .photo');
      if(host) host.classList.add('broken');
    });
  });

  /* parallax on interior hero image */
  var bgimg = document.querySelector('.phero .bgimg');
  if(bgimg && !reduce){
    addEventListener('scroll', function(){
      var y = Math.min(window.scrollY, 600);
      bgimg.style.transform = 'scale(1.05) translateY(' + (y * 0.18) + 'px)';
    }, {passive:true});
  }

  /* hero rotator */
  var slides = Array.prototype.slice.call(document.querySelectorAll('#rotator .slide'));
  if(slides.length){
    var dots = Array.prototype.slice.call(document.querySelectorAll('#heroDots button'));
    var cur = 0, timer = null;
    var show = function(i){
      slides[cur].classList.remove('on'); dots[cur].classList.remove('on');
      cur = i % slides.length;
      slides[cur].classList.add('on'); dots[cur].classList.add('on');
    };
    if(!reduce){
      timer = setInterval(function(){ show(cur+1); }, 5200);
      dots.forEach(function(d,i){ d.addEventListener('click', function(){ clearInterval(timer); show(i); timer = setInterval(function(){ show(cur+1); }, 5200); }); });
    } else {
      dots.forEach(function(d,i){ d.addEventListener('click', function(){ show(i); }); });
    }
  }

  /* marquee duplicate */
  var track = document.getElementById('sealTrack');
  if(track && !reduce){ track.innerHTML += track.innerHTML; }

  /* reveals with per-parent stagger */
  var sel = '.reveal,.reveal-l,.reveal-r,.reveal-s';
  var els = Array.prototype.slice.call(document.querySelectorAll(sel));
  if(!reduce){
    var groups = new Map();
    els.forEach(function(el){
      var p = el.parentElement;
      if(!groups.has(p)) groups.set(p, 0);
      var n = groups.get(p);
      el.style.transitionDelay = (Math.min(n,7) * 80) + 'ms';
      groups.set(p, n+1);
    });
  }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -36px 0px'});
  els.forEach(function(el){ io.observe(el); });
  /* headline underline draw */
  var hio = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); hio.unobserve(e.target); } });
  }, {threshold:.4});
  document.querySelectorAll('.sec-head, .split .body, .split > div').forEach(function(el){ hio.observe(el); });

  /* count-up */
  var counters = document.querySelectorAll('[data-count]');
  if(counters.length){
    var done = false;
    var cio = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting && !done){
          done = true;
          counters.forEach(function(el){
            var t = parseInt(el.getAttribute('data-count'),10);
            var sup = el.querySelector('sup'); var supHTML = sup ? sup.outerHTML : '';
            if(reduce){ el.innerHTML = t + supHTML; return; }
            var start = null;
            var step = function(ts){
              if(!start) start = ts;
              var p = Math.min((ts-start)/900,1), ez = 1-Math.pow(1-p,3);
              el.innerHTML = Math.round(ez*t) + supHTML;
              if(p<1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          });
          cio.disconnect();
        }
      });
    }, {threshold:.5});
    cio.observe(counters[0]);
  }

  /* mobile menu */
  var mm = document.getElementById('mobileMenu');
  var mo = document.getElementById('menuOpen'), mc = document.getElementById('menuClose');
  if(mo){ mo.addEventListener('click', function(){ mm.classList.add('open'); }); }
  if(mc){ mc.addEventListener('click', function(){ mm.classList.remove('open'); }); }
  if(mm){ mm.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ mm.classList.remove('open'); }); }); }

  /* contact form -> mailto */
  var cf = document.getElementById('contactForm');
  if(cf){
    cf.addEventListener('submit', function(ev){
      ev.preventDefault();
      var f = new FormData(cf);
      var body = 'Name: '+f.get('name')+'%0AOrganization: '+(f.get('org')||'—')+'%0AReason: '+f.get('reason')+'%0A%0A'+encodeURIComponent(f.get('msg'));
      location.href = 'mailto:collaborate@emergingtech.co?subject='+encodeURIComponent('['+f.get('reason')+'] Inquiry from '+f.get('name'))+'&body='+body;
    });
  }

  /* job application forms (preview site — does not transmit data anywhere) */
  var af = document.getElementById('applyForm');
  if(af){
    af.addEventListener('submit', function(ev){
      ev.preventDefault();
      var note = document.getElementById('applySubmitted');
      var btn = af.querySelector('button[type="submit"]');
      if(btn){ btn.disabled = true; btn.textContent = 'Preview only — not submitted'; }
      if(note){ note.classList.add('show'); note.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'center'}); }
    });
  }
})();
