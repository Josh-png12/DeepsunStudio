// Local fake of the two Supabase REST endpoints the public site uses. No network, no real data.
// Control: GET /__set?t=empty|data|error|slow&l=ok|fail  ·  GET /__log shows received writes.
const http = require('http')
let t = 'data', l = 'ok', st = 'ok'
const log = []
const rows = [
  { id: '1', created_at: '2026-01-01', name: 'Cliente de prueba A', company: 'Empresa Demo', role: 'Gerente', message: 'Texto de prueba para verificar el diseño del carrusel de opiniones. No es una reseña real.', rating: 5, avatar_url: null, result_image_url: null, video_url: null, approved: true, featured: true },
  { id: '2', created_at: '2026-01-02', name: 'Cliente de prueba B', company: null, role: null, message: 'Segundo texto de prueba, más corto. Dato ficticio solo para QA local.', rating: 4, avatar_url: null, result_image_url: null, video_url: null, approved: true, featured: false },
  { id: '3', created_at: '2026-01-03', name: 'Cliente de prueba C', company: 'Demo S.A.S.', role: 'Dueña', message: 'Tercer texto de prueba para comprobar el desplazamiento horizontal del carrusel y los botones.', rating: 3, avatar_url: null, result_image_url: null, video_url: null, approved: true, featured: false },
]
http.createServer((req, res) => {
  const h = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*', 'Content-Type': 'application/json' }
  const u = new URL(req.url, 'http://x')
  if (req.method === 'OPTIONS') { res.writeHead(204, h); return res.end() }
  if (u.pathname === '/__set') { t = u.searchParams.get('t') || t; l = u.searchParams.get('l') || l; st = u.searchParams.get('s') || st; res.writeHead(200, h); return res.end(JSON.stringify({ t, l, st })) }
  if (u.pathname === '/__log') { res.writeHead(200, h); return res.end(JSON.stringify(log)) }
  let body = ''
  req.on('data', (c) => (body += c))
  req.on('end', () => {
    if (u.pathname === '/rest/v1/testimonials' && req.method === 'GET') {
      if (t === 'error') { res.writeHead(500, h); return res.end(JSON.stringify({ message: 'boom' })) }
      const send = () => { res.writeHead(200, h); res.end(JSON.stringify(t === 'empty' ? [] : rows)) }
      return t === 'slow' ? setTimeout(send, 4000) : send()
    }
    if (req.method === 'POST' && u.pathname.startsWith('/storage/v1/object/')) {
      log.push({ table: 'STORAGE', body: u.pathname + ' bytes=' + body.length })
      if (st === 'fail') { res.writeHead(400, h); return res.end(JSON.stringify({ message: 'Bucket not found (storage)' })) }
      res.writeHead(200, h); return res.end(JSON.stringify({ Id: 'id-' + Date.now(), Key: u.pathname.replace('/storage/v1/object/', '') }))
    }
    if (req.method === 'POST' && u.pathname.startsWith('/rest/v1/')) {
      log.push({ table: u.pathname.split('/').pop(), body: body.slice(0, 400) })
      if (l === 'fail') { res.writeHead(401, h); return res.end(JSON.stringify({ message: 'new row violates row-level security policy' })) }
      res.writeHead(201, h); return res.end('')
    }
    res.writeHead(404, h); res.end('{}')
  })
}).listen(54399, () => console.log('mock on 54399'))
