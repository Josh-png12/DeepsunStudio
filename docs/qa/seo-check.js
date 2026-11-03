const routes=['/','/studio','/servicios','/proyectos','/proyectos/siepa','/proyectos/ms-usuarios','/blog','/blog/cuanto-cuesta-sitio-web-colombia','/contacto','/portal/login'];
const tech=/react|next\.?js|typescript|python|node\.?js|tailwind|selenium|beautifulsoup|jwt|bcrypt|mysql|postgres|mongodb|framework|stack/i;
(async()=>{for(const r of routes){const h=await (await fetch('http://localhost:3100'+r)).text();
const get=(re)=>{const m=h.match(re);return m?m[1]:'—'};
const title=get(/<title>([^<]*)<\/title>/),canon=get(/<link rel="canonical" href="([^"]*)"/),ogt=get(/<meta property="og:title" content="([^"]*)"/),ogi=get(/<meta property="og:image" content="([^"]*)"/),ogu=get(/<meta property="og:url" content="([^"]*)"/),robots=get(/<meta name="robots" content="([^"]*)"/),desc=get(/<meta name="description" content="([^"]*)"/),alt=(h.match(/hreflang/g)||[]).length,gsv=/google-site-verification/.test(h),theme=get(/<meta name="theme-color" content="([^"]*)"/),icon=get(/<link rel="icon" href="([^"]*)"/);
const ld=[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>{try{const j=JSON.parse(m[1]);return j['@type']}catch(e){return 'INVALID'}});
const kw=get(/<meta name="keywords" content="([^"]*)"/);
const flag=[title,desc,kw,ogt].some(t=>tech.test(t))||ld.length&&tech.test(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).join(''));
console.log(`${r}\n  title: ${title}\n  canonical: ${canon} | og:url: ${ogu} | og:image: ${ogi}\n  robots: ${robots} | hreflang: ${alt} | gsc-token: ${gsv} | theme: ${theme} | icon: ${icon}\n  json-ld: ${ld.join(', ')||'none'} | tech terms in title/desc/keywords/ld: ${flag}`)}})()
