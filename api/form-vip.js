// Form VIP Mentoring Nyari Cuan: perkenalan, check-in, kumpulkan tugas, refleksi akhir.
// POST menyimpan isian; GET (dengan PIN admin) mengambil semua isian.
// Repo publik, jadi yang disimpan di sini hanya hash PIN, bukan PIN-nya.
const kv = require('./_kv');
const crypto = require('crypto');
const PIN_HASH = '0ffc6dd089a0416ee416ce3b6c9498fcc29afa65b63de6ce48febdccca337059';
const KEY = 'sm:fvip';
const TYPES = ['perkenalan', 'checkin', 'tugas', 'refleksi'];

function clean(v, max) { return String(v == null ? '' : v).slice(0, max || 3000); }

module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!kv.ready) return res.status(503).json({ ok: false, off: true });
  try {
    if (req.method === 'POST') {
      let b = req.body;
      if (typeof b === 'string') b = JSON.parse(b || '{}');
      b = b || {};
      if (TYPES.indexOf(b.type) < 0 || !clean(b.nama, 80).trim()) return res.status(400).json({ ok: false });
      const f = {};
      Object.keys(b.f || {}).slice(0, 12).forEach(function (k) { f[clean(k, 40)] = clean(b.f[k]); });
      const row = { ts: Date.now(), type: b.type, nama: clean(b.nama, 80).trim(), pekan: clean(b.pekan, 10), f: f };
      await kv.pipe([['LPUSH', KEY, JSON.stringify(row)], ['LTRIM', KEY, 0, 1999]]);
      return res.status(200).json({ ok: true });
    }
    const pin = clean(req.headers['x-pin'], 40).trim().toUpperCase();
    if (crypto.createHash('sha256').update(pin).digest('hex') !== PIN_HASH) return res.status(401).json({ ok: false });
    const r = await kv.pipe([['LRANGE', KEY, 0, -1]]);
    const rows = (r[0] || []).map(function (x) { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean);
    return res.status(200).json({ ok: true, rows: rows });
  } catch (e) { return res.status(500).json({ ok: false }); }
};
