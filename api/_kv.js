// Upstash Redis lewat REST (tanpa paket npm). Variabel dari integrasi Vercel Storage.
// Nama variabel bisa berawalan lain (KV_, UPSTASH_REDIS_, atau awalan khusus), jadi dicari menurut akhirannya.
function env(suffixes) {
  for (const s of suffixes) {
    const k = Object.keys(process.env).find(function (x) { return x === s || x.endsWith('_' + s); });
    if (k && process.env[k]) return process.env[k];
  }
  return '';
}
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || env(['REST_API_URL', 'REDIS_REST_URL']);
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || env(['REST_API_TOKEN', 'REDIS_REST_TOKEN']);
exports.ready = !!(URL_ && TOKEN);
exports.pipe = async function (cmds) {
  const r = await fetch(URL_ + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds)
  });
  if (!r.ok) throw new Error('kv ' + r.status);
  return (await r.json()).map(function (x) { return x.result; });
};
exports.wib = function () { // tanggal hari ini di WIB, YYYYMMDD
  return new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10).replace(/-/g, '');
};
