
// Minimal Lightbox (no deps)
(function(){
  var overlay = document.createElement('div');
  overlay.className = 'lb-backdrop';
  var wrap = document.createElement('div');
  wrap.className = 'lb-wrap';

  var close = document.createElement('a');
  close.href = '#'; close.className = 'lb-close'; close.setAttribute('aria-label','Close');
  close.textContent = '×';

  var prev = document.createElement('a');
  prev.href = '#'; prev.className = 'lb-arrow lb-prev'; prev.textContent = '‹';

  var next = document.createElement('a');
  next.href = '#'; next.className = 'lb-arrow lb-next'; next.textContent = '›';

  var fig = document.createElement('figure'); fig.className = 'lb-figure';
  var img = document.createElement('img'); img.alt = '';
  var cap = document.createElement('figcaption'); cap.className = 'lb-cap';
  fig.appendChild(img); fig.appendChild(cap);

  document.addEventListener('DOMContentLoaded', function(){
    wrap.appendChild(close); wrap.appendChild(prev); wrap.appendChild(next); wrap.appendChild(fig);
    document.body.appendChild(wrap); document.body.appendChild(overlay);
  });

  var links = []; var current = -1; var grouped = []; var group = '';

  function refreshLinks(){ links = [].slice.call(document.querySelectorAll('a.lightbox')); }
  function openAt(index){
    current = index;
    var a = links[index];
    group = a.getAttribute('data-group') || '';
    grouped = group ? links.filter(function(l){ return l.getAttribute('data-group')===group; }) : [a];
    if(group){ current = grouped.indexOf(a); } else { grouped = [a]; }
    var target = grouped[current];
    img.src = target.getAttribute('href');
    var innerImg = target.querySelector('img');
    img.alt = (innerImg && innerImg.alt) || '';
    cap.textContent = target.getAttribute('data-caption') || img.alt || '';
    wrap.classList.add('lb-show');
    overlay.style.display = 'block';
    document.documentElement.style.overflow = 'hidden';
  }

  document.addEventListener('click', function(ev){
    var a = ev.target.closest('a.lightbox');
    if(!a) return;
    ev.preventDefault();
    refreshLinks();
    var idx = links.indexOf(a);
    openAt(idx);
  });

  function closeLb(e){
    if(e) e.preventDefault();
    wrap.classList.remove('lb-show');
    overlay.style.display = 'none';
    document.documentElement.style.overflow = '';
  }
  function step(dir){
    if(grouped.length < 2) return;
    current = (current + dir + grouped.length) % grouped.length;
    var target = grouped[current];
    img.src = target.getAttribute('href');
    var innerImg = target.querySelector('img');
    img.alt = (innerImg && innerImg.alt) || '';
    cap.textContent = target.getAttribute('data-caption') || img.alt || '';
  }
  overlay.addEventListener('click', closeLb);
  close.addEventListener('click', closeLb);
  prev.addEventListener('click', function(e){ e.preventDefault(); step(-1); });
  next.addEventListener('click', function(e){ e.preventDefault(); step(1); });

  document.addEventListener('keydown', function(e){
    if(!wrap.classList.contains('lb-show')) return;
    if(e.key === 'Escape') closeLb();
    if(e.key === 'ArrowLeft') step(-1);
    if(e.key === 'ArrowRight') step(1);
  });
})();
