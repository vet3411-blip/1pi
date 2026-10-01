import { pickRoute, presets } from './routes.js';
const form = document.querySelector('#walk-form');
const result = document.querySelector('#result');
function showResult() {
  const data = new FormData(form);
  const route = pickRoute(Object.fromEntries(data));
  result.replaceChildren();
  const head = document.createElement('div'); head.className = 'result-head';
  const copy = document.createElement('div');
  const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'ВАША ПРОГУЛКА';
  const title = document.createElement('h3'); title.textContent = route.title;
  const description = document.createElement('p'); description.textContent = route.description;
  const badge = document.createElement('span'); badge.className = 'result-badge'; badge.textContent = `${route.time} минут`;
  copy.append(eyebrow,title,description); head.append(copy,badge);
  const list = document.createElement('ol'); list.className = 'route-line'; list.setAttribute('aria-label','Места на маршруте');
  for (const [index, stop] of route.stops.entries()) { const item = document.createElement('li'); const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2,'0'); item.append(number,document.createTextNode(stop)); list.append(item); }
  result.append(head,list); result.hidden = false;
  result.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
form.addEventListener('submit',event=>{ event.preventDefault(); showResult(); });
document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{
  const preset = presets[button.dataset.preset];
  for (const [key,value] of Object.entries(preset)) form.elements.namedItem(key).value = String(value);
  sceneButtons.find(item=>item.dataset.scene===preset.sound)?.click();
  showResult();
  result.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}));

const sceneImages = {
  quiet: {src:'./assets/embankment.webp',alt:'Тихая набережная Светлоречья с мостом над водой'},
  nature: {src:'./assets/courtyard.webp',alt:'Тенистый двор Светлоречья с зелёными воротами'},
  city: {src:'./assets/canal.webp',alt:'Мощёная улица Светлоречья вдоль канала'}
};
const heroImage = document.querySelector('#hero-image');
const sceneButtons = [...document.querySelectorAll('[data-scene]')];
let sceneTimer;
for (const button of sceneButtons) button.addEventListener('click',()=>{
  const scene = button.dataset.scene;
  for (const item of sceneButtons) {const active = item === button; item.classList.toggle('is-active',active); item.setAttribute('aria-pressed',String(active));}
  form.elements.namedItem('sound').value = scene;
  if (heroImage.getAttribute('src') === sceneImages[scene].src) return;
  clearTimeout(sceneTimer);
  heroImage.classList.add('is-changing');
  sceneTimer = setTimeout(()=>{heroImage.src=sceneImages[scene].src; heroImage.alt=sceneImages[scene].alt; heroImage.classList.remove('is-changing');},180);
});
form.addEventListener('change',event=>{
  if (event.target.name !== 'sound') return;
  const button = sceneButtons.find(item=>item.dataset.scene===event.target.value);
  button?.click();
});

const pauseToggle = document.querySelector('#pause-toggle');
const pausePanel = document.querySelector('#pause-panel');
const pauseClose = document.querySelector('#pause-close');
const breathText = document.querySelector('#breath-text');
let breathTimer, endTimer, breathStage = 0;
function closePause(){clearInterval(breathTimer);clearTimeout(endTimer);pausePanel.hidden=true;pauseToggle.setAttribute('aria-expanded','false');pauseToggle.focus();}
pauseToggle.addEventListener('click',()=>{
  if(!pausePanel.hidden){closePause();return;}
  pausePanel.hidden=false;pauseToggle.setAttribute('aria-expanded','true');breathStage=0;breathText.textContent='Вдохните медленно';pauseClose.focus();
  breathTimer=setInterval(()=>{breathStage++;breathText.textContent=breathStage%2?'Медленно выдохните':'Вдохните медленно';},5000);
  endTimer=setTimeout(()=>{breathText.textContent='Пауза закончилась. Можно идти дальше.';clearInterval(breathTimer);},60000);
});
pauseClose.addEventListener('click',closePause);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!pausePanel.hidden)closePause();});

