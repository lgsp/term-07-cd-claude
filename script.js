// ── UTILS ──────────────────────────────────────────
const R4 = v => isFinite(v) ? Math.round(v*10000)/10000 : (v>0?'+∞':'-∞');

// ── FUNCTION REGISTRY ──────────────────────────────
const FN = {
  eu2:     { f: x=>Math.exp(x*x),          fp: x=>2*x*Math.exp(x*x),                   fpp: x=>(4*x*x+2)*Math.exp(x*x),              s:'e^(x²)' },
  ln1x2:   { f: x=>Math.log(1+x*x),        fp: x=>2*x/(1+x*x),                          fpp: x=>(2-2*x*x)/(1+x*x)**2,                  s:'ln(1+x²)' },
  sqrt1x2: { f: x=>Math.sqrt(1+x*x),       fp: x=>x/Math.sqrt(1+x*x),                  fpp: x=>1/(1+x*x)**1.5,                        s:'√(1+x²)' },
  sinx2:   { f: x=>x===0?1:Math.sin(x)/x,  fp: x=>x===0?0:(Math.cos(x)*x-Math.sin(x))/(x*x), fpp: x=>x===0?-1/3:((2-x*x)*Math.sin(x)-2*x*Math.cos(x))/(x*x*x), s:'sin(x)/x' },
  x3ex:    { f: x=>x*Math.exp(-x),         fp: x=>(1-x)*Math.exp(-x),                  fpp: x=>(x-2)*Math.exp(-x),                    s:'x·e^(−x)' },
  cos2x:   { f: x=>Math.cos(2*x),          fp: x=>-2*Math.sin(2*x),                    fpp: x=>-4*Math.cos(2*x),                      s:'cos(2x)' },
  x3m3x:   { f: x=>x*x*x-3*x,             fp: x=>3*x*x-3,                              fpp: x=>6*x,                                   s:'x³−3x' },
  ex:      { f: x=>Math.exp(x),            fp: x=>Math.exp(x),                          fpp: x=>Math.exp(x),                           s:'e^x' },
  lnx:     { f: x=>x>0?Math.log(x):NaN,   fp: x=>1/x,                                  fpp: x=>-1/(x*x),                              s:'ln(x)' },
  sinx:    { f: x=>Math.sin(x),            fp: x=>Math.cos(x),                          fpp: x=>-Math.sin(x),                          s:'sin(x)' },
  xex:     { f: x=>x*Math.exp(-x),         fp: x=>(1-x)*Math.exp(-x),                  fpp: x=>(x-2)*Math.exp(-x),                    s:'x·e^(−x)' },
  x4:      { f: x=>x*x*x*x-6*x*x,         fp: x=>4*x*x*x-12*x,                        fpp: x=>12*x*x-12,                             s:'x⁴−6x²' },
  xe2x:    { f: x=>x*Math.exp(x/2),        fp: x=>(1+x/2)*Math.exp(x/2),               fpp: x=>(1/4*x+1)*Math.exp(x/2),               s:'x·e^(x/2)' },
  x2ex:    { f: x=>x*x*Math.exp(-x),       fp: x=>x*(2-x)*Math.exp(-x),                fpp: x=>(x*x-4*x+2)*Math.exp(-x),              s:'x²·e^(−x)' },
  // composée-calc extras
  ln3x1:   { f: x=>Math.log(3*x+1),       fp: x=>3/(3*x+1),                            fpp: x=>-9/(3*x+1)**2,                         s:'ln(3x+1)' },
  sqrt_u:  { f: x=>Math.sqrt(x*x+1),      fp: x=>x/Math.sqrt(x*x+1),                  fpp: x=>1/(x*x+1)**1.5,                        s:'√(x²+1)' },
  u5:      { f: x=>(2*x-1)**5,             fp: x=>10*(2*x-1)**4,                        fpp: x=>80*(2*x-1)**3,                         s:'(2x−1)⁵' },
  cos2xp:  { f: x=>Math.cos(2*x+Math.PI/3), fp: x=>-2*Math.sin(2*x+Math.PI/3),        fpp: x=>-4*Math.cos(2*x+Math.PI/3),            s:'cos(2x+π/3)' },
  lncosx:  { f: x=>Math.log(Math.cos(x)),  fp: x=>-Math.tan(x),                         fpp: x=>-1/(Math.cos(x)**2),                   s:'ln(cos x)' },
  e_sinx:  { f: x=>Math.exp(Math.sin(x)), fp: x=>Math.cos(x)*Math.exp(Math.sin(x)),    fpp: x=>(-Math.sin(x)+Math.cos(x)**2)*Math.exp(Math.sin(x)), s:'e^(sin x)' },
  x2_ex:   { f: x=>x*x*Math.exp(-x),      fp: x=>x*(2-x)*Math.exp(-x),                fpp: x=>(x*x-4*x+2)*Math.exp(-x),              s:'x²·e^(−x)' },
  x3m3x_f2:{ f: x=>x*x*x-3*x,            fp: x=>3*x*x-3,                              fpp: x=>6*x,                                   s:'x³−3x' },
  x4_2x2:  { f: x=>x*x*x*x-2*x*x,        fp: x=>4*x*x*x-4*x,                          fpp: x=>12*x*x-4,                              s:'x⁴−2x²' },
};
// Map select keys to FN keys
const DC_MAP = { eu2:'eu2', ln3x1:'ln3x1', sqrt_u:'sqrt_u', u5:'u5', cos2x:'cos2xp', lncosx:'lncosx', e_sinx:'e_sinx', x2_ex:'x2_ex' };
const GD_MAP = { eu2:'eu2', ln1x2:'ln1x2', sqrt1x2:'sqrt1x2', sinx2:'sinx2', x3ex:'x3ex', cos2x:'cos2x' };
const GC_MAP = { x3:'x3m3x', ex:'ex', lnx:'lnx', sinx:'sinx', x4:'x4', xex:'xex' };
const GE_MAP = { xex:'x3ex', x3m3x:'x3m3x', x2ex:'x2ex', ln1x2:'ln1x2', xe2x:'xe2x' };
const F2_MAP = { x3m3x:'x3m3x', ex:'ex', lnx:'lnx', sinx:'sinx', xex:'xex', x4:'x4_2x2' };

// ── GRAPH UTILITIES ──────────────────────────────────
function drawFunctionGraph(canvasId, fnKey, options={}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth||880, H = canvas.offsetHeight||300;
  canvas.width=W; canvas.height=H;

  const { xmin=-5, xmax=5, showFp=false, showFpp=false, showTangent=false, tangentA=null, showInflexions=false } = options;
  const fn = FN[fnKey]; if (!fn) return;

  const pad = {l:45, r:20, t:18, b:32};
  const gW=W-pad.l-pad.r, gH=H-pad.t-pad.b;

  // Sample
  const N=W*3;
  const pts=[], ptsFp=[], ptsFpp=[];
  for(let i=0;i<=N;i++){
    const x=xmin+i/N*(xmax-xmin);
    try{const y=fn.f(x); pts.push(isFinite(y)&&Math.abs(y)<50?{x,y}:null);}catch{pts.push(null);}
    try{const y=fn.fp(x); ptsFp.push(isFinite(y)&&Math.abs(y)<50?{x,y}:null);}catch{ptsFp.push(null);}
    try{const y=fn.fpp(x); ptsFpp.push(isFinite(y)&&Math.abs(y)<50?{x,y}:null);}catch{ptsFpp.push(null);}
  }

  const allY=[...pts,...ptsFp,...ptsFpp].filter(Boolean).map(p=>p.y);
  const ymin=Math.max(-30,Math.min(...allY,-0.5)-0.5);
  const ymax=Math.min(30,Math.max(...allY,0.5)+0.5);

  const toX=x=>pad.l+(x-xmin)/(xmax-xmin)*gW;
  const toY=y=>pad.t+gH-(y-ymin)/(ymax-ymin)*gH;

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#1d2028'; ctx.fillRect(0,0,W,H);

  // Grid
  ctx.strokeStyle='rgba(44,48,64,0.8)'; ctx.lineWidth=0.7;
  for(let gx=Math.ceil(xmin);gx<=Math.floor(xmax);gx++){
    const x=toX(gx); ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,pad.t+gH);ctx.stroke();
    if(gx!==0){ctx.fillStyle='#5a5860';ctx.font='9px Source Code Pro,monospace';ctx.fillText(gx,x-4,pad.t+gH+12);}
  }
  for(let gy=Math.ceil(ymin);gy<=Math.floor(ymax);gy++){
    const y=toY(gy); ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+gW,y);ctx.stroke();
    if(gy!==0){ctx.fillStyle='#5a5860';ctx.font='9px Source Code Pro,monospace';ctx.fillText(gy,2,y+3);}
  }

  // Axes
  if(ymin<0&&ymax>0){const y0=toY(0);ctx.strokeStyle='rgba(232,164,80,0.3)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.l,y0);ctx.lineTo(pad.l+gW,y0);ctx.stroke();}
  if(xmin<0&&xmax>0){const x0=toX(0);ctx.strokeStyle='rgba(232,164,80,0.3)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0,pad.t);ctx.lineTo(x0,pad.t+gH);ctx.stroke();}

  // f''
  if(showFpp){
    ctx.strokeStyle='rgba(144,112,224,0.7)'; ctx.lineWidth=1.5;
    ctx.beginPath(); let pen=true;
    ptsFpp.forEach(p=>{if(!p){pen=true;return;} const px=toX(p.x),py=toY(p.y); pen?ctx.moveTo(px,py):ctx.lineTo(px,py); pen=false;});
    ctx.stroke();
  }

  // f'
  if(showFp){
    ctx.strokeStyle='rgba(32,192,176,0.85)'; ctx.lineWidth=1.8;
    ctx.beginPath(); let pen=true;
    ptsFp.forEach(p=>{if(!p){pen=true;return;} const px=toX(p.x),py=toY(p.y); pen?ctx.moveTo(px,py):ctx.lineTo(px,py); pen=false;});
    ctx.stroke();
  }

  // Convex coloring
  if(showInflexions){
    for(let i=0;i<ptsFpp.length-1;i++){
      const p=ptsFpp[i];
      if(!p) continue;
      const x=toX(p.x), convex=p.y>0;
      ctx.fillStyle=convex?'rgba(80,200,120,0.06)':'rgba(232,104,32,0.06)';
      ctx.fillRect(x,pad.t,gW/(ptsFpp.length-1),gH);
    }
  }

  // Tangent
  if(showTangent && tangentA!==null){
    try{
      const fa=fn.f(tangentA), fpa=fn.fp(tangentA);
      const x1=xmin, x2=xmax;
      const y1=fa+fpa*(x1-tangentA), y2=fa+fpa*(x2-tangentA);
      ctx.strokeStyle='rgba(216,176,32,0.8)'; ctx.lineWidth=1.3; ctx.setLineDash([5,3]);
      ctx.beginPath();ctx.moveTo(toX(x1),toY(y1));ctx.lineTo(toX(x2),toY(y2));ctx.stroke();
      ctx.setLineDash([]);
      // Point
      ctx.fillStyle='#d8b020';ctx.beginPath();ctx.arc(toX(tangentA),toY(fa),5,0,2*Math.PI);ctx.fill();
      ctx.fillStyle='#d8b020';ctx.font='10px Source Code Pro,monospace';
      ctx.fillText(`a=${tangentA}`,toX(tangentA)+7,toY(fa)-4);
    }catch{}
  }

  // f
  ctx.strokeStyle='#f59040'; ctx.lineWidth=2.2;
  ctx.beginPath(); let pen=true;
  pts.forEach(p=>{if(!p){pen=true;return;} const px=toX(p.x),py=toY(p.y); pen?ctx.moveTo(px,py):ctx.lineTo(px,py); pen=false;});
  ctx.stroke();

  // Legend
  ctx.fillStyle='#f59040';ctx.font='bold 10px Source Code Pro,monospace';ctx.fillText(`y = ${fn.s}`,pad.l+4,pad.t+14);
  if(showFp){ctx.fillStyle='rgba(32,192,176,0.85)';ctx.fillText("y = f'",pad.l+4,pad.t+26);}
  if(showFpp){ctx.fillStyle='rgba(144,112,224,0.7)';ctx.fillText("y = f''",pad.l+4,pad.t+38);}
}

function drawDerivGraph(){
  const k=GD_MAP[document.getElementById('gd-func').value]||'eu2';
  const a=+document.getElementById('gd-a').value;
  const showFp=document.getElementById('gd-showdf').checked;
  drawFunctionGraph('canvas-deriv', k, {xmin:-5,xmax:5, showFp, showTangent:true, tangentA:a});
}
function drawConvexGraph(){
  const k=GC_MAP[document.getElementById('gc-func').value]||'x3m3x';
  const showFpp=document.getElementById('gc-showf2').checked;
  const showTan=document.getElementById('gc-showtan').checked;
  const a=showTan?1:null;
  drawFunctionGraph('canvas-convex',k,{xmin:-4,xmax:4,showFpp,showTangent:showTan,tangentA:a,showInflexions:true});
}
function drawEtudeGraph(){
  const k=GE_MAP[document.getElementById('ge-func').value]||'x3ex';
  drawFunctionGraph('canvas-etude',k,{
    xmin:-2,xmax:6,
    showFp:document.getElementById('ge-fp').checked,
    showFpp:document.getElementById('ge-f2').checked,
    showTangent:document.getElementById('ge-tan').checked,
    tangentA:1, showInflexions:false,
  });
}

window.addEventListener('resize',()=>{drawDerivGraph();drawConvexGraph();drawEtudeGraph();});
setTimeout(()=>{drawDerivGraph();drawConvexGraph();drawEtudeGraph();},100);

// ── CALCULATEURS ────────────────────────────────────
function calcDerivee(){
  const k=DC_MAP[document.getElementById('dc-func').value]||'eu2';
  const x=+document.getElementById('dc-x').value;
  const fn=FN[k]; if(!fn) return;
  const el=document.getElementById('deriv-res');
  try{
    const fx=fn.f(x), fpx=fn.fp(x);
    el.innerHTML=`\\(${fn.s}\\) en \\(x=${x}\\) : \\(f(${x})=${R4(fx)}\\), \\(f'(${x})=${R4(fpx)}\\)`;
    if(window.MathJax) MathJax.typeset([el]);
  }catch(e){el.textContent='Erreur (domaine ?)';}
}
calcDerivee();

function calcF2(){
  const k=F2_MAP[document.getElementById('f2-func').value]||'x3m3x';
  const x=+document.getElementById('f2-x').value;
  const fn=FN[k]; if(!fn) return;
  const el=document.getElementById('f2-res');
  try{
    const fx=fn.f(x), fpx=fn.fp(x), fppx=fn.fpp(x);
    const conv=fppx>1e-9?'convexe (f\'\'> 0)':fppx<-1e-9?'concave (f\'\'< 0)':'possible inflexion (f\'\'= 0)';
    el.innerHTML=`\\(f(${x})=${R4(fx)}\\) — \\(f'(${x})=${R4(fpx)}\\) — \\(f''(${x})=${R4(fppx)}\\) → <strong>${conv}</strong>`;
    if(window.MathJax) MathJax.typeset([el]);
  }catch(e){el.textContent='Erreur (domaine ?)';}
}
calcF2();

// ── PYODIDE ──────────────────────────────────────────
let pyodide=null,pyoLoad=false;
const origC={};
document.querySelectorAll('.py-code').forEach(ta=>{origC[ta.id]=ta.value;});
async function loadPyo(){
  if(pyodide) return true; if(pyoLoad) return false; pyoLoad=true;
  const st=document.getElementById('py-status');st.textContent='⏳ Chargement Python…';
  try{
    const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
    document.head.appendChild(s);await new Promise((res,rej)=>{s.onload=res;s.onerror=rej;});
    pyodide=await window.loadPyodide();
    st.textContent='✓ Python prêt';st.classList.add('ready');setTimeout(()=>st.classList.add('hidden'),3000);return true;
  }catch(e){st.textContent='✗ Erreur Python';return false;}
}
async function runPy(id){
  const code=document.getElementById(id+'-code').value;
  const out=document.getElementById(id+'-out');
  out.className='py-out active';out.textContent='⏳ Exécution…';out.style.color='#888';
  const ok=await loadPyo();
  if(!ok){out.className='py-out active error';out.textContent='Python non disponible.';return;}
  try{
    let stdout='';pyodide.setStdout({batched:s=>stdout+=s+'\n'});
    await pyodide.runPythonAsync(code);
    out.className='py-out active';out.style.color='#a6e3a1';out.textContent=stdout||'(aucune sortie)';
  }catch(e){out.className='py-out active error';out.textContent='⚠ '+e.message;}
}
function dlPy(id){
  const code=document.getElementById(id+'-code').value;
  const fname=document.getElementById(id+'-code').closest('.py-block').querySelector('.py-title').textContent.trim();
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));a.download=fname;a.click();
}
function rstPy(id){
  document.getElementById(id+'-code').value=origC[id+'-code'];
  const out=document.getElementById(id+'-out');out.className='py-out';out.textContent='';
}

// ── QCM ──────────────────────────────────────────────
const allQ=[
  {q:"La dérivée de \\(f(x)=e^{x^2}\\) est :",
   opts:["\\(e^{x^2}\\)","\\(2xe^{x^2}\\)","\\(x^2e^{x^2}\\)","\\(2e^{x^2}\\)"],ans:1,
   exp:"\\(u=x^2\\), \\(u'=2x\\) → \\(f'=(u)'e^u=2xe^{x^2}\\)."},
  {q:"La dérivée de \\(f(x)=\\ln(3x+1)\\) est :",
   opts:["\\(\\frac{1}{3x+1}\\)","\\(\\frac{3}{3x+1}\\)","\\(3\\ln(3x+1)\\)","\\(\\frac{1}{x}\\)"],ans:1,
   exp:"\\((\\ln u)'=\\frac{u'}{u}=\\frac{3}{3x+1}\\)."},
  {q:"\\(f''\\geq 0\\) sur \\(I\\) signifie que \\(f\\) est :",
   opts:["Croissante sur \\(I\\)","Concave sur \\(I\\)","Convexe sur \\(I\\)","À extremum sur \\(I\\)"],ans:2,
   exp:"Définition : \\(f\\) convexe \\(\\Leftrightarrow f''\\geq 0\\). La courbe est au-dessus de ses tangentes."},
  {q:"Un point d'inflexion de \\(\\mathcal{C}_f\\) est un point où :",
   opts:["\\(f'=0\\)","\\(f=0\\)","\\(f''\\) change de signe","\\(f\\) admet un extremum"],ans:2,
   exp:"Un point d'inflexion est un point où la convexité change, i.e. où \\(f''\\) change de signe."},
  {q:"La dérivée de \\(f(x)=\\sqrt{x^2+4}\\) est :",
   opts:["\\(\\frac{1}{2\\sqrt{x^2+4}}\\)","\\(\\frac{x}{\\sqrt{x^2+4}}\\)","\\(\\frac{2x}{\\sqrt{x^2+4}}\\)","\\(\\sqrt{2x}\\)"],ans:1,
   exp:"\\(u=x^2+4\\), \\(u'=2x\\) → \\((\\sqrt{u})'=\\frac{u'}{2\\sqrt{u}}=\\frac{2x}{2\\sqrt{x^2+4}}=\\frac{x}{\\sqrt{x^2+4}}\\)."},
  {q:"Pour \\(f(x)=x^3\\), le point \\(x=0\\) est :",
   opts:["Un maximum","Un minimum","Un point d'inflexion","Un point de discontinuité"],ans:2,
   exp:"\\(f''(x)=6x\\), \\(f''(0)=0\\) et \\(f''\\) change de signe en 0 (de négatif à positif). C'est un point d'inflexion."},
  {q:"La dérivée de \\(f(x)=(2x-1)^4\\) est :",
   opts:["\\(4(2x-1)^3\\)","\\(8(2x-1)^3\\)","\\(4(2x-1)^4\\)","\\(2(2x-1)^3\\)"],ans:1,
   exp:"\\(u=2x-1\\), \\(u'=2\\) → \\((u^4)'=4u^3\\cdot u'=4(2x-1)^3\\cdot 2=8(2x-1)^3\\)."},
  {q:"\\(f(x)=e^x\\) est :",
   opts:["Concave sur \\(\\mathbb{R}\\)","Convexe sur \\(\\mathbb{R}\\)","Ni convexe ni concave","Convexe uniquement pour \\(x>0\\)"],ans:1,
   exp:"\\(f''(x)=e^x>0\\) pour tout \\(x\\). Donc \\(e^x\\) est convexe sur \\(\\mathbb{R}\\) et \\(e^x\\geq 1+x\\) pour tout \\(x\\)."},
  {q:"La règle de la chaîne donne \\((g\\circ f)'(x) = \\) :",
   opts:["\\(g'(x)\\cdot f'(x)\\)","\\(f'(x)\\cdot g'(f(x))\\)","\\(f'(g(x))\\cdot g'(x)\\)","\\(g'(f'(x))\\)"],ans:1,
   exp:"\\((g\\circ f)'(x)=f'(x)\\cdot g'(f(x))\\) : dérivée de l'intérieur \\(\\times\\) dérivée de l'extérieur calculée à l'intérieur."},
  {q:"\\(f''(a)=0\\) est-il suffisant pour que \\(a\\) soit un point d'inflexion ?",
   opts:["Oui, toujours","Non, il faut aussi que \\(f''\\) change de signe","Seulement si \\(f'(a)=0\\)","Seulement si \\(f\\) est paire"],ans:1,
   exp:"Non ! Contre-exemple : \\(x^4\\), \\(f''(0)=0\\) mais \\(f''\\geq 0\\) partout, pas de changement de signe. Il FAUT le changement de signe."},
  {q:"La dérivée de \\(\\ln(\\cos x)\\) est :",
   opts:["\\(\\frac{1}{\\cos x}\\)","\\(-\\tan x\\)","\\(\\frac{-\\sin x}{\\cos x}\\)","B et C sont identiques"],ans:3,
   exp:"\\(u=\\cos x\\), \\(u'=-\\sin x\\) → \\((\\ln u)'=\\frac{u'}{u}=\\frac{-\\sin x}{\\cos x}=-\\tan x\\). Les réponses B et C sont identiques."},
  {q:"Pour une fonction convexe \\(f\\) et tous \\(a,b\\) de son domaine :",
   opts:["\\(f\\left(\\frac{a+b}{2}\\right)\\geq\\frac{f(a)+f(b)}{2}\\)","\\(f\\left(\\frac{a+b}{2}\\right)\\leq\\frac{f(a)+f(b)}{2}\\)","\\(f(a+b)=f(a)+f(b)\\)","\\(f\\) est croissante"],ans:1,
   exp:"Pour une fonction convexe, la courbe est en-dessous des cordes : \\(f\\left(\\frac{a+b}{2}\\right)\\leq\\frac{f(a)+f(b)}{2}\\)."},
];

let curQ=[],answered={},cSec=0,cPaused=false,cIntv=null;
function shuf(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function pad2(n){return String(n).padStart(2,'0');}
function newQCM(){answered={};curQ=shuf(allQ).slice(0,8);document.getElementById('qcm-r').classList.remove('active');document.getElementById('sc-v').textContent='0 / 0';resetC();startC();renderQ();}
function renderQ(){
  const c=document.getElementById('qcm-c');
  c.innerHTML=curQ.map((q,qi)=>`
    <div class="qcm-q" id="qq-${qi}">
      <div class="qcm-question">${qi+1}. ${q.q}</div>
      <div class="qcm-opts">
        ${q.opts.map((o,oi)=>`
          <div class="qcm-opt" id="opt-${qi}-${oi}" onclick="selO(${qi},${oi})">
            <span class="opt-l">${String.fromCharCode(65+oi)}</span><span>${o}</span>
          </div>`).join('')}
      </div>
      <div class="qcm-fb" id="fb-${qi}"></div>
    </div>`).join('');
  if(window.MathJax)MathJax.typeset([c]);
}
function selO(qi,oi){if(answered[qi]!==undefined)return;document.querySelectorAll(`#qq-${qi} .qcm-opt`).forEach(e=>e.classList.remove('selected'));document.getElementById(`opt-${qi}-${oi}`).classList.add('selected');answered[qi]=oi;}
function submitQCM(){
  let sc=0,tot=curQ.length;
  curQ.forEach((q,qi)=>{
    const ch=answered[qi];
    const qEl=document.getElementById(`qq-${qi}`),fb=document.getElementById(`fb-${qi}`);
    q.opts.forEach((_,oi)=>{const el=document.getElementById(`opt-${qi}-${oi}`);el.classList.add('disabled');if(oi===q.ans)el.classList.add('correct');if(ch===oi&&ch!==q.ans)el.classList.add('wrong');});
    if(ch===q.ans){sc++;qEl.classList.add('correct');fb.innerHTML=`✓ Correct ! ${q.exp}`;}
    else{qEl.classList.add('wrong');fb.innerHTML=`✗ ${ch===undefined?'Non répondu. ':''}Réponse : <strong>${q.opts[q.ans]}</strong>. ${q.exp}`;}
    fb.classList.add('active');
  });
  document.getElementById('sc-v').textContent=`${sc} / ${tot}`;
  const pct=Math.round(sc/tot*100);
  const msg=pct>=87?'EXCELLENT — MAÎTRISE COMPLÈTE':pct>=62?'BIEN — QUELQUES POINTS À CONSOLIDER':'À RETRAVAILLER — RELIRE LE COURS';
  document.getElementById('r-sc').textContent=`${sc} / ${tot} — ${pct} %`;
  document.getElementById('r-msg').textContent=msg;
  document.getElementById('qcm-r').classList.add('active');
  if(window.MathJax)MathJax.typeset([document.getElementById('qcm-r'),document.getElementById('qcm-c')]);
  stopC();
}
function startC(){stopC();cPaused=false;document.getElementById('btn-c').textContent='Pause';cIntv=setInterval(()=>{if(!cPaused){cSec++;document.getElementById('c-d').textContent=`${pad2(Math.floor(cSec/60))}:${pad2(cSec%60)}`;}},1000);}
function stopC(){clearInterval(cIntv);cIntv=null;}
function resetC(){stopC();cSec=0;cPaused=false;document.getElementById('c-d').textContent='00:00';document.getElementById('btn-c').textContent='Pause';}
function toggleC(){cPaused=!cPaused;document.getElementById('btn-c').textContent=cPaused?'Reprendre':'Pause';}
newQCM();

// ── SCROLL REVEAL & NAV ──────────────────────────────
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),{threshold:0.07});
document.querySelectorAll('section').forEach(s=>io.observe(s));
const navLinks=document.querySelectorAll('nav a');
window.addEventListener('scroll',()=>{let cur='';document.querySelectorAll('main section').forEach(s=>{if(window.scrollY>=s.offsetTop-130)cur=s.id;});navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur));},{passive:true});