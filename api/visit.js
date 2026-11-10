// Penghitung kunjungan sanmalique.com. Kunci berawalan "sm:" supaya tidak
// tercampur dengan website lain yang memakai database yang sama.
const kv = require('./_kv');
module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!kv.ready) return res.status(200).json({ off: true });
  try {
    const d = 'sm:v:d:' + kv.wib();
    let r;
    if (req.method === 'POST') r = await kv.pipe([['INCR', 'sm:v:total'], ['INCR', d], ['EXPIRE', d, 259200]]);
    else r = await kv.pipe([['GET', 'sm:v:total'], ['GET', d]]);
    res.status(200).json({ total: +r[0] || 0, today: +r[1] || 0 });
  } catch (e) { res.status(200).json({ off: true }); }
};
