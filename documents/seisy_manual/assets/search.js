
(function(){
  var input = document.getElementById('q');
  var box = document.getElementById('results');
  if(!input || !box) return;
  var index = window.SEISY_INDEX || [];

  function esc(s){
    return s.replace(/[&<>]/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];
    });
  }

  function snippet(text, terms){
    var low = text.toLowerCase(), best = -1, bestScore = -1;
    terms.forEach(function(t){
      var i = low.indexOf(t);
      if(i >= 0){
        var score = 1;
        if(i < 60) score += 1;
        if(score > bestScore){ bestScore = score; best = i; }
      }
    });
    if(best < 0) best = 0;
    var start = Math.max(0, best - 40);
    var out = text.slice(start, start + 150);
    terms.forEach(function(t){
      if(!t) return;
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')','gi');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return (start > 0 ? '…' : '') + esc(out).replace(/&lt;mark&gt;/g,'<mark>')
      .replace(/&lt;\/mark&gt;/g,'</mark>') + (text.length > start + 150 ? '…' : '');
  }

  function search(query){
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if(!terms.length) return [];
    var hits = [];
    index.forEach(function(entry){
      var hay = (entry.title + ' ' + entry.section + ' ' + entry.text +
                 ' ' + (entry.keywords || '')).toLowerCase();
      var score = 0;
      for(var i=0;i<terms.length;i++){
        var t = terms[i], pos = hay.indexOf(t);
        if(pos < 0) return;              // every term must appear
        score += 1;
        if((entry.title + ' ' + entry.section).toLowerCase().indexOf(t) >= 0)
          score += 5;                    // heading match ranks first
      }
      hits.push({score: score, entry: entry});
    });
    hits.sort(function(a,b){ return b.score - a.score; });
    return hits.slice(0, 12);
  }

  function render(query){
    var hits = search(query);
    if(!query.trim()){ box.className = ''; box.innerHTML = ''; return; }
    box.className = 'on';
    if(!hits.length){
      box.innerHTML = '<div class="none">没有匹配的内容</div>';
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    box.innerHTML = hits.map(function(h){
      var e = h.entry;
      return '<a class="hit" href="' + e.url + '"><b>' +
        esc(e.title) + ' › ' + esc(e.section) + '</b><span>' +
        snippet(e.text, terms) + '</span></a>';
    }).join('');
  }

  var timer = null;
  input.addEventListener('input', function(){
    clearTimeout(timer);
    var v = input.value;
    timer = setTimeout(function(){ render(v); }, 120);
  });
  input.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){ input.value=''; render(''); input.blur(); }
    if(e.key === 'Enter'){
      var first = box.querySelector('.hit');
      if(first) window.location.href = first.getAttribute('href');
    }
  });
  document.addEventListener('keydown', function(e){
    if(e.key === '/' && document.activeElement !== input){
      e.preventDefault(); input.focus();
    }
  });
})();
