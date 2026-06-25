/* MAJUL AI · interacciones del sitio */
(function(){
  document.documentElement.classList.add('js');
  // Mobile nav
  function initNav(){
    var burger=document.querySelector('.nav-burger');
    var links=document.querySelector('.nav-links');
    if(burger&&links){
      burger.addEventListener('click',function(){links.classList.toggle('open');});
      links.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click',function(){links.classList.remove('open');});
      });
    }
  }
  // Reveal on scroll (with fail-safe so content is NEVER stuck hidden)
  function initReveal(){
    var els=document.querySelectorAll('.reveal');
    function showAll(){els.forEach(function(e){e.classList.add('in');});}
    if(!('IntersectionObserver' in window)){showAll();return;}
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}
      });
    },{threshold:.08,rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(e){io.observe(e);});
    // Fail-safe: if the observer never fires (detached/offscreen iframe,
    // print, etc.) reveal everything so nothing stays invisible.
    setTimeout(function(){
      if(document.querySelectorAll('.reveal.in').length===0) showAll();
    },1400);
  }
  // Fake form
  function initForm(){
    var f=document.querySelector('form[data-netlify]');
    if(!f)return;
    function showOk(){
      var ok=f.querySelector('.form-ok');
      if(ok){ok.style.display='flex';var ff=f.querySelector('.form-fields');if(ff)ff.style.display='none';}
    }
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var btn=f.querySelector('button[type="submit"]');
      if(btn)btn.disabled=true;
      fetch('/',{
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams(new FormData(f)).toString()
      }).then(function(r){
        if(!r.ok)throw new Error('status '+r.status);
        showOk();
      }).catch(function(){
        if(btn)btn.disabled=false;
        alert('No pudimos enviar el mensaje. Por favor escribinos directamente a info@majul.ai');
      });
    });
  }
  // Scroll cue removed — addressed the false-bottom by tightening section spacing instead.
  // Side rail (scroll-spy): connects sections and shows position + how many remain,
  // so on big screens a section seam no longer reads as the end of the page.
  function initDotNav(){
    var secs=[].slice.call(document.querySelectorAll('body > section[data-screen-label]'));
    if(secs.length<3) return;
    var nav=document.createElement('nav');
    nav.className='dotnav';
    nav.setAttribute('aria-label','Secciones de la página');
    var map=[];
    secs.forEach(function(s,i){
      if(!s.id) s.id='sec-'+(i+1);
      var raw=s.getAttribute('data-screen-label')||'';
      var label=(raw.indexOf('·')>-1?raw.split('·').pop():raw).trim()||('Sección '+(i+1));
      var a=document.createElement('a');
      a.href='#'+s.id;
      a.setAttribute('aria-label',label);
      a.innerHTML='<span class="lbl">'+label+'</span><span class="dot" aria-hidden="true"></span>';
      a.addEventListener('click',function(e){
        e.preventDefault();
        var y=s.getBoundingClientRect().top+window.pageYOffset-70;
        window.scrollTo({top:y,behavior:'smooth'});
      });
      nav.appendChild(a);
      map.push({s:s,a:a});
    });
    document.body.appendChild(nav);
    function isDark(el){ return el.classList.contains('dark'); }
    function setActive(){
      var mid=window.innerHeight/2, best=null, bestD=Infinity;
      map.forEach(function(m){
        var r=m.s.getBoundingClientRect();
        if(r.top<=mid && r.bottom>=mid){ best=m; bestD=-1; return; }
        var c=(r.top+r.bottom)/2, d=Math.abs(c-mid);
        if(bestD!==-1 && d<bestD){ bestD=d; best=m; }
      });
      if(best){
        map.forEach(function(m){ m.a.classList.toggle('active', m===best); });
        nav.classList.toggle('on-dark', isDark(best.s));
      }
    }
    var ticking=false;
    function onScroll(){
      if(ticking) return;
      ticking=true;
      requestAnimationFrame(function(){ setActive(); ticking=false; });
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll,{passive:true});
    setActive();
  }
  if(document.readyState!=='loading'){initNav();initReveal();initForm();initDotNav();}
  else document.addEventListener('DOMContentLoaded',function(){initNav();initReveal();initForm();initDotNav();});
})();
