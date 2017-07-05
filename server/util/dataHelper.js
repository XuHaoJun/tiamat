const ss = require("../../assets/stages.json");
const ms = require("../../assets/monsters.json");

let si;
let mi;
const slen = ss.length;
const mlen = ms.length;
for (si = 0; si < slen; si += 1) {
  const s = ss[si];
  for (mi = 0; mi < mlen; mi += 1) {
    const m = ms[mi];
    if (m.stages.indexOf(s._id) !== -1 && !m.isBoss) {
      s.monsters.push(m._id);
    }
  }
}
