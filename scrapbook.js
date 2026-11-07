/* Popcorn Roulette — scrapbook decorations. Adds stickers only; never touches the app logic. */
(function () {
  if (window.__scrapbook) return; window.__scrapbook = true;
  const main = document.querySelector('main'); if (!main) return;
  const NS = 'http://www.w3.org/2000/svg';
 
  const scallop = (R, bump, n) => {
    let pts = [];
    for (let a = 0; a < 360; a += 3) {
      const r = R + bump * Math.cos(a * n * Math.PI / 180), t = a * Math.PI / 180;
      pts.push((50 + r * Math.cos(t)).toFixed(2) + ',' + (50 + r * Math.sin(t)).toFixed(2));
    }
    return pts.join(' ');
  };
  const add = (parent, html, cls, css) => {
    const d = document.createElement('div');
    d.className = 'deco ' + (cls || ''); d.style.cssText = css || ''; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = html; parent.appendChild(d); return d;
  };
  const cap = (text, fill, css, cls) => add(main,
    '<svg viewBox="0 0 100 100"><polygon points="' + scallop(43, 3.4, 14) + '" fill="' + fill + '"/>' +
    '<circle cx="50" cy="50" r="37" fill="none" stroke="rgba(21,16,18,.28)" stroke-width="1.2" stroke-dasharray="2 3"/></svg><span>' + text + '</span>',
    'cap float ' + (cls || ''), css);
  const star = (parent, size, color, css) => add(parent,
    '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '"><path fill="' + color + '" d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z"/></svg>',
    'spark', css);
 
  /* header tagline */
  const sub = document.querySelector('header .sub');
  if (sub && !document.querySelector('.tagline')) {
    const t = document.createElement('div'); t.className = 'tagline';
    t.innerHTML = 'Movies / Shows / Fate<small>pick a mood, spin, watch. no endless scrolling.</small>';
    sub.after(t);
  }
 
  /* bottle caps + tape */
  cap("it's giving<br>movie night", '#f3b5c9', 'top:92px;right:-26px;--r:8deg;transform:rotate(12deg)', 'hide-sm');
  cap('now<br>showing', '#f2e08e', 'bottom:-34px;right:34px;--r:-6deg;transform:rotate(-10deg)');
  add(main, 'watch it for the plot', 'tape float hide-sm', 'top:196px;right:6px;--r:4deg;transform:rotate(-7deg)');
 
  /* popcorn bucket sticker */
  add(main,
    '<svg class="bucket" viewBox="0 0 90 110">' +
    '<g stroke="#151012" stroke-width="2.4" stroke-linejoin="round">' +
    '<circle cx="24" cy="30" r="13" fill="#fff6dc"/><circle cx="44" cy="22" r="15" fill="#f2e08e"/><circle cx="64" cy="30" r="13" fill="#fff6dc"/>' +
    '<circle cx="34" cy="38" r="11" fill="#f2e08e"/><circle cx="55" cy="38" r="11" fill="#fff6dc"/>' +
    '<path d="M10 44h70l-8 60H18z" fill="#fff"/>' +
    '<path d="M10 44h70l-1.6 12H11.6z" fill="#f3b5c9"/></g>' +
    '<g fill="#e0809f"><path d="M24 56h9l-1.5 48H21z"/><path d="M43 56h9l-.5 48h-8z"/><path d="M62 56h9l-4 48h-8z"/></g>' +
    '<path d="M10 44h70l-8 60H18z" fill="none" stroke="#151012" stroke-width="2.4" stroke-linejoin="round"/></svg>',
    'float hide-sm', 'bottom:-30px;left:-24px;--r:-9deg;transform:rotate(-12deg)');
 
  /* sparkles on the cream sheet */
  [[18, '#151012', 'top:28px;right:132px'], [14, '#e0809f', 'top:260px;left:-8px'], [20, '#e0b94a', 'bottom:120px;right:14px'],
   [12, '#151012', 'top:150px;right:60px'], [16, '#e0809f', 'bottom:70px;left:46%']].forEach(a =>
    star(main, a[0], a[1], a[2] + ';z-index:1'));
 
  /* roulette wheel on the picker panel */
  const picker = document.getElementById('picker');
  let wheel = null;
  if (picker) {
    picker.style.position = 'relative';
    wheel = document.createElement('div');
    wheel.className = 'deco reel'; wheel.setAttribute('aria-hidden', 'true');
    wheel.style.cssText = 'top:-46px;right:-22px;width:112px;height:112px;border:4px solid #fff;' +
      'background:radial-gradient(circle,#151012 0 9px,#fff 10px 13px,transparent 14px),' +
      'conic-gradient(#f3b5c9 0 45deg,#fbf4e4 0 90deg,#f2e08e 0 135deg,#d8c9ef 0 180deg,#f3b5c9 0 225deg,#fbf4e4 0 270deg,#f2e08e 0 315deg,#cfe2c6 0 360deg)';
    picker.appendChild(wheel);
    [[14, '#fbf4e4', 'top:70px;right:112px'], [10, '#f3b5c9', 'top:150px;left:12px'], [12, '#f2e08e', 'bottom:110px;right:20px']]
      .forEach(a => star(picker, a[0], a[1], a[2] + ';z-index:4'));
    const spin = () => {
      wheel.style.setProperty('--turn', (720 + Math.random() * 720 | 0) + 'deg');
      wheel.classList.remove('spin'); void wheel.offsetWidth; wheel.classList.add('spin');
    };
    ['pickBtn', 'trendBtn'].forEach(id => { const b = document.getElementById(id); if (b) b.addEventListener('click', spin); });
  }
})();
