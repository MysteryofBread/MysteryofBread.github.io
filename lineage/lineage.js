
// Vanilla SVG tree renderer with pan/zoom and arbitrary depth
(function(){
  var svg = document.getElementById('lineage-canvas');
  if(!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var g = document.createElementNS(NS,'g');
  svg.appendChild(g);

  function fetchJSON(url, cb){ fetch(url).then(r=>r.json()).then(cb); }

  var scale=1, panX=20, panY=20, isPanning=false, last={x:0,y:0};
  function applyTransform(){ g.setAttribute('transform','translate('+panX+','+panY+') scale('+scale+')'); }

  svg.addEventListener('mousedown', function(e){ isPanning=true; last.x=e.clientX; last.y=e.clientY; });
  window.addEventListener('mousemove', function(e){
    if(!isPanning) return;
    panX += (e.clientX-last.x); panY += (e.clientY-last.y);
    last.x=e.clientX; last.y=e.clientY; applyTransform();
  });
  window.addEventListener('mouseup', function(){ isPanning=false; });
  svg.addEventListener('wheel', function(e){
    e.preventDefault();
    var delta = e.deltaY>0? 0.9:1.1;
    scale = Math.max(0.3, Math.min(3, scale*delta));
    applyTransform();
  }, {passive:false});

  function nodeBox(x,y,w,h){ var r=document.createElementNS(NS,'rect'); r.setAttribute('x',x); r.setAttribute('y',y); r.setAttribute('rx',6); r.setAttribute('ry',6);
    r.setAttribute('width',w); r.setAttribute('height',h); r.setAttribute('class','lineage-node'); return r; }
  function nodeText(x,y,str){ var t=document.createElementNS(NS,'text'); t.setAttribute('x',x); t.setAttribute('y',y); t.setAttribute('class','lineage-text'); t.textContent=str; return t; }
  function curve(x1,y1,x2,y2){ var p=document.createElementNS(NS,'path'); var mx=(x1+x2)/2; p.setAttribute('d','M'+x1+' '+y1+' C '+mx+' '+y1+', '+mx+' '+y2+', '+x2+' '+y2); p.setAttribute('fill','none'); p.setAttribute('stroke','#5b1a17'); p.setAttribute('stroke-width','1.4'); return p; }

  function layout(node, depth){
    if(depth===undefined) depth=0;
    var boxW=160, boxH=44, vGap=70, hGap=60;
    var children = node.children||[];
    var childLayouts = children.map(function(c){return layout(c, depth+1);});
    var width = Math.max(boxW, childLayouts.reduce(function(a,c){return a+c.width+hGap;}, -hGap));
    var heights = childLayouts.map(function(c){return c.height;});
    var height = boxH + (childLayouts.length? vGap + Math.max.apply(Math, heights) : 0);
    return {node:node, width:width, height:height, children:childLayouts, boxW:boxW, boxH:boxH, vGap:vGap, hGap:hGap, depth:depth};
  }

  function render(lay, x, y){
    var xStart = x + (lay.width - lay.boxW)/2;
    g.appendChild(nodeBox(xStart,y, lay.boxW, lay.boxH));
    var name = lay.node.name || '—';
    var title = lay.node.title ? " · " + lay.node.title : "";
    g.appendChild(nodeText(xStart+8, y+18, name));
    var line2 = (lay.node.born? (lay.node.born + (lay.node.died? "–"+lay.node.died:"")):"") + title;
    g.appendChild(nodeText(xStart+8, y+36, line2));
    var cx = x;
    var cy = y + lay.boxH + lay.vGap;
    lay.children.forEach(function(ch){
      var childX = cx + (ch.width - ch.boxW)/2;
      var x1 = xStart + lay.boxW/2, y1 = y + lay.boxH;
      var x2 = childX + ch.boxW/2,  y2 = y + lay.boxH + lay.vGap;
      g.appendChild(curve(x1,y1,x2,y2));
      render(ch, cx, cy);
      cx += ch.width + lay.hGap;
    });
  }

  fetchJSON('./lineage.json', function(data){
    var root = layout(data);
    render(root, 10, 10);
    applyTransform();
  });
})();
