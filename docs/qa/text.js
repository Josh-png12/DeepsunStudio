const { chromium } = require('playwright-core');
const norm=s=>s.replace(/\s+/g,' ').trim();
async function lines(p){return p.evaluate(()=>{const out=new Set();const wk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=wk.nextNode()){const e=n.parentElement;if(!e||e.closest('script,style,[hidden]'))continue;const t=n.textContent.replace(/\s+/g,' ').trim();if(t.length>2)out.add(t)}return [...out]})}
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
for(const lang of ['es','en']){
 const c1=await b.newContext({viewport:{width:1440,height:900}});const r=await c1.newPage();await r.goto('http://localhost:3200/integral-reconstruccion.html',{waitUntil:'networkidle'});
 if(lang==='en'){await r.click('[data-lang=en]');await r.waitForTimeout(200)}
 const c2=await b.newContext({viewport:{width:1440,height:900}});await c2.addInitScript(l=>localStorage.setItem('deepsun-lang',l),lang);const m=await c2.newPage();await m.goto('http://localhost:3100/',{waitUntil:'networkidle'});await m.waitForTimeout(800);
 const A=(await lines(r)).map(norm).filter(t=>!/^DEEPSUN\.$/.test(t)),B=new Set((await lines(m)).map(norm));const Aset=new Set(A);
 const onlyRef=A.filter(t=>!B.has(t)),onlyMine=[...B].filter(t=>!Aset.has(t));
 console.log(`\n=== ${lang.toUpperCase()}: ref ${A.length} strings, impl ${B.size}; only in v02: ${onlyRef.length}; only in impl: ${onlyMine.length}`);
 console.log('-- only in v02:');onlyRef.forEach(t=>console.log('  • '+t.slice(0,110)));
 console.log('-- only in impl (first 40):');onlyMine.slice(0,40).forEach(t=>console.log('  + '+t.slice(0,110)));
}
await b.close()})()
