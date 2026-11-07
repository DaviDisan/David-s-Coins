/* =========================================================
   David's Coins & Collectibles — site scripts
   ========================================================= */

/* ---- Business info: edit these and every matching spot on the page updates ---- */
const BUSINESS = {
  phone: '(000) 000-0000',
  email: 'info@example.com',
};

// Bump this when photos are replaced so browsers fetch the new files
const PHOTO_VERSION = 3;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- business info ---------- */
function applyBusinessInfo() {
  const tel = '+1' + BUSINESS.phone.replace(/\D/g, '');
  $$('[data-biz="phone"]').forEach(el => { el.textContent = BUSINESS.phone; el.href = 'tel:' + tel; });
  $$('[data-biz="email"]').forEach(el => { el.textContent = BUSINESS.email; el.href = 'mailto:' + BUSINESS.email; });
  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
}

/* ---------- mobile nav ---------- */
function initNav() {
  const btn = $('.nav-toggle');
  const nav = $('#primary-nav');
  const close = () => { nav.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu'); };
  btn.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); btn.focus(); } });

  // highlight the section in view
  const links = $$('.primary-nav a[href^="#"]');
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => { a.classList.remove('is-current'); a.removeAttribute('aria-current'); });
      const a = map.get(en.target.id);
      if (a) { a.classList.add('is-current'); a.setAttribute('aria-current', 'true'); }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/* ---------- live spot prices ---------- */
const METALS = { XAU: 'Gold', XAG: 'Silver', XPT: 'Platinum', XPD: 'Palladium' };
const spot = {};       // latest price per symbol
const prevSpot = {};   // previous refresh, for direction arrows
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

async function fetchSpot() {
  const results = await Promise.allSettled(Object.keys(METALS).map(sym =>
    fetch(`https://api.gold-api.com/price/${sym}`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => [sym, Number(d.price)])
  ));
  let ok = 0;
  results.forEach(r => {
    if (r.status !== 'fulfilled' || !isFinite(r.value[1])) return;
    const [sym, price] = r.value;
    if (spot[sym] != null) prevSpot[sym] = spot[sym];
    spot[sym] = price;
    ok++;
  });
  renderSpot(ok > 0);
  updateCalc();
}

function renderSpot(ok) {
  const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  Object.keys(METALS).forEach(sym => {
    const price = spot[sym];
    const prev = prevSpot[sym];
    const diff = price != null && prev != null ? price - prev : 0;
    const dir = diff > 0 ? 'up' : diff < 0 ? 'down' : '';
    const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '';

    const t = $(`[data-ticker] [data-metal="${sym}"]`);
    if (t) {
      $('.p', t).textContent = price != null ? usd.format(price) : 'N/A';
      const c = $('.c', t);
      c.className = 'c ' + dir;
      c.textContent = dir ? `${arrow} ${usd.format(Math.abs(diff))}` : '';
    }

    const card = $(`[data-price-cards] [data-metal="${sym}"]`);
    if (card) {
      $('.price', card).textContent = price != null ? usd.format(price) : 'Price on request';
      $('.delta', card).innerHTML = price == null
        ? 'Live feed unavailable'
        : dir
          ? `<span class="${dir}">${arrow} ${usd.format(Math.abs(diff))}</span> since last update · ${time}`
          : `per troy oz · updated ${time}`;
    }
  });
  const status = $('[data-price-status]');
  if (status && !ok) status.textContent = 'Live prices are temporarily unavailable. Contact us for today\'s numbers.';
}

/* ---------- melt calculator ---------- */
function updateCalc() {
  const out = $('[data-calc-value]');
  if (!out) return;
  const [sym, oz] = $('#calc-item').value.split('|');
  const qty = Math.max(0, parseInt($('#calc-qty').value, 10) || 0);
  out.textContent = spot[sym] != null ? usd.format(spot[sym] * Number(oz) * qty) : '—';
}
function initCalc() {
  const form = $('[data-calc]');
  if (!form) return;
  form.addEventListener('input', updateCalc);
  form.addEventListener('submit', e => e.preventDefault());
}

/* ---------- inventory gallery ---------- */
const imgPath = name => `assets/img/photos/${name}.jpg?v=${PHOTO_VERSION}`;

function initGallery() {
  const cards = $$('.coin-card');
  cards.forEach(card => {
    const { front, back } = card.dataset;
    const badge = $('.badge', card);
    const title = $('h3', card).textContent;
    // aligned photos are 960×1200 (portrait) or 1280×960 (data-wide)
    const [w, h] = 'wide' in card.dataset ? [1280, 960] : [960, 1200];

    const media = document.createElement('button');
    media.className = 'media';
    media.type = 'button';
    media.setAttribute('aria-label', `View ${title} larger`);
    media.innerHTML = `
      <img class="front" src="${imgPath(front)}" alt="${title}, front" loading="lazy" width="${w}" height="${h}">
      <img class="back" src="${imgPath(back)}" alt="" loading="lazy" width="${w}" height="${h}">
      <span class="flip-hint" aria-hidden="true">Hover to flip</span>`;

    const body = document.createElement('div');
    body.className = 'body';
    body.append(badge.cloneNode(true), ...$$('h3, p', card));
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    actions.innerHTML = `
      <button class="btn btn-gold btn-sm" type="button" data-inquire="Buying from inventory" data-item="${title}">Inquire to Buy</button>
      <button class="btn-link" type="button" data-view>View</button>`;
    body.append(actions);

    card.prepend(media);
    card.append(body);
    media.addEventListener('click', () => openViewer(card));
    $('[data-view]', actions).addEventListener('click', () => openViewer(card));
  });
  // touch devices can't hover; change hint text
  if (matchMedia('(hover: none)').matches) $$('.flip-hint').forEach(h => (h.textContent = 'Tap to view'));

  // filters
  $$('.chip-btn').forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    $$('.chip-btn').forEach(b => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    cards.forEach(c => (c.hidden = f !== 'all' && c.dataset.cat !== f));
  }));
}

/* ---------- viewer dialog ---------- */
let viewerCard = null;
function openViewer(card) {
  const dlg = $('[data-viewer]');
  viewerCard = card;
  $('[data-viewer-title]', dlg).textContent = $('h3', card).textContent;
  $('[data-viewer-desc]', dlg).textContent = $('.body p', card).textContent;
  $('[data-viewer-badge]', dlg).textContent = $('.body .badge', card).textContent;
  const labels = (card.dataset.labels || 'Front,Back').split(',');
  $$('.seg button', dlg).forEach((b, i) => (b.textContent = labels[i]));
  setSide('front');
  dlg.showModal();
}
function setSide(side) {
  const dlg = $('[data-viewer]');
  const img = $('[data-viewer-img]', dlg);
  const title = $('h3', viewerCard).textContent;
  img.src = imgPath(viewerCard.dataset[side]);
  img.alt = `${title}, ${$(`.seg button[data-side="${side}"]`, dlg).textContent.toLowerCase()}`;
  $$('.seg button', dlg).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.side === side)));
}
function initViewer() {
  const dlg = $('[data-viewer]');
  $$('.seg button', dlg).forEach(b => b.addEventListener('click', () => setSide(b.dataset.side)));
  $('[data-viewer-close]', dlg).addEventListener('click', () => dlg.close());
  $('[data-viewer-inquire]', dlg).addEventListener('click', () => {
    dlg.close();
    openInquiry('Buying from inventory', $('h3', viewerCard).textContent);
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // backdrop click
}

/* ---------- quick inquiry dialog ---------- */
const INQUIRY_TITLES = {
  'Buying from inventory': 'Inquire to buy',
  'Selling coins or bullion': 'Get an offer on your coins',
  'Free appraisal': 'Request a free appraisal',
  'Estate / large collection': 'Discuss a collection',
  'Collector supplies': 'Ask about supplies',
  'Looking for a specific coin': 'Send us your wish list',
};
const INQUIRY_PROMPTS = {
  'Selling coins or bullion': 'What do you have? Include dates, quantities, and any grading. Email photos of both sides after sending.',
  'Free appraisal': 'Describe the coins you\'d like appraised. Email photos of the front and back after sending.',
  'Estate / large collection': 'Roughly how many coins, and what types?',
  'Collector supplies': 'Which supplies and how many?',
  'Looking for a specific coin': 'Which coin, grade, and budget are you looking for?',
};

function openInquiry(topic = 'General question', item = '') {
  const dlg = $('[data-inquiry]');
  const form = $('form', dlg);
  form.elements.topic.value = topic;
  form.elements.item.value = item;
  $('[data-inq-title]', dlg).textContent = item ? `Inquire: ${item}` : (INQUIRY_TITLES[topic] || 'Ask us anything');
  const msg = form.elements.message;
  msg.value = item ? `Hi, I'm interested in the ${item}. Is it still available, and what's the price with shipping?` : '';
  msg.placeholder = INQUIRY_PROMPTS[topic] || 'How can we help?';
  $$('.err', form).forEach(e => (e.textContent = ''));
  $$('[aria-invalid]', form).forEach(i => i.removeAttribute('aria-invalid'));
  $('.form-status', form)?.remove();
  dlg.showModal();
  form.elements.name.focus();
}

function initInquiry() {
  const dlg = $('[data-inquiry]');
  $('[data-inquiry-close]', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-inquire]');
    if (btn) openInquiry(btn.dataset.inquire, btn.dataset.item || '');
  });
}

/* ---------- forms (mailto) ---------- */
function initForms() {
  const rules = {
    name: v => v.trim() ? '' : 'Please enter your name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter an email like name@example.com.',
  };
  $$('[data-contact]').forEach(form => {
    const check = input => {
      const msg = rules[input.name]?.(input.value) ?? '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      const err = document.getElementById(input.getAttribute('aria-describedby'));
      if (err) err.textContent = msg;
      return !msg;
    };
    Object.keys(rules).forEach(n => form.elements[n].addEventListener('blur', e => check(e.target)));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const bad = Object.keys(rules).map(n => form.elements[n]).filter(i => !check(i));
      if (bad.length) { bad[0].focus(); return; }
      const f = form.elements;
      const item = f.item?.value;
      const subject = item ? `Inquiry: ${item}` : `Website inquiry: ${f.topic.value}`;
      const body = [
        `Name: ${f.name.value}`, `Phone: ${f.phone.value || 'n/a'}`, `Email: ${f.email.value}`,
        `Topic: ${f.topic.value}`, item ? `Item: ${item}` : '', '', f.message.value,
      ].filter((l, i) => l || i > 4).join('\n');
      location.href = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      let status = $('.form-status', form);
      if (!status) { status = document.createElement('p'); status.className = 'form-status'; status.setAttribute('role', 'status'); form.append(status); }
      status.textContent = `Opening your email app… If nothing happens, email us at ${BUSINESS.email}.`;
    });
  });
}

/* ---------- scroll reveal ---------- */
function initReveal() {
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const groups = ['.svc-card', '.steps li', '.price-card', '.coin-card', '.supply-card', '.section-head', '.calc'];
  const els = [];
  groups.forEach(sel => $$(sel).forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', `${(i % 4) * 60}ms`); els.push(el); }));
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
}

/* ---------- boot ---------- */
applyBusinessInfo();
initNav();
initGallery();
initViewer();
initInquiry();
initCalc();
initForms();
initReveal();
fetchSpot();
setInterval(() => { if (!document.hidden) fetchSpot(); }, 60_000);
