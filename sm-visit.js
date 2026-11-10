/* Catat kunjungan (sekali per hari per browser) dan tampilkan angkanya bila ada elemen #vc. */
(function () {
  var today = new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10), seen = '';
  try { seen = localStorage.getItem('sm-v'); } catch (e) {}
  fetch('/api/visit', seen === today ? {} : { method: 'POST' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d || d.off) return;
      try { localStorage.setItem('sm-v', today); } catch (e) {}
      var el = document.getElementById('vc');
      if (!el) return;
      var f = function (n) { return n.toLocaleString('id-ID'); };
      el.textContent = f(d.total) + ' kunjungan ke website ini · ' + f(d.today) + ' hari ini';
      el.hidden = false;
    })
    .catch(function () {});
})();
