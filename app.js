import { pickRoute, presets } from './routes.js';
const form = document.querySelector('#walk-form');
const result = document.querySelector('#result');
function showResult({scroll = true} = {}) {
  const data = new FormData(form);
  const route = pickRoute(Object.fromEntries(data));
  const sound = data.get('sound');
  const nightLead = {
    nature: 'Зелёные дворы и небольшие сады, где городской фон уступает шелесту листвы и мягкому свету фонарей.',
    city: 'Тёплый свет окон вдоль канала, маленькие мосты и спокойный ритм вечернего города.'
  };
  const titleText = timeMode === 'night' && sound === 'city' ? 'Вечер у канала' : route.title;
  const descriptionText = timeMode === 'night' && nightLead[sound]
    ? `${nightLead[sound]} ${route.description.slice(route.description.indexOf('. ') + 2)}`
    : route.description;
  result.replaceChildren();
  const head = document.createElement('div'); head.className = 'result-head';
  const copy = document.createElement('div');
  const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'ВАША ПРОГУЛКА';
  const title = document.createElement('h3'); title.textContent = titleText;
  const description = document.createElement('p'); description.textContent = descriptionText;
  const badge = document.createElement('span'); badge.className = 'result-badge'; badge.textContent = `${route.time} минут`;
  copy.append(eyebrow,title,description); head.append(copy,badge);
  const list = document.createElement('ol'); list.className = 'route-line'; list.setAttribute('aria-label','Места на маршруте');
  for (const [index, stop] of route.stops.entries()) { const item = document.createElement('li'); const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2,'0'); item.append(number,document.createTextNode(stop)); list.append(item); }
  result.append(head,list); result.hidden = false;
  result.classList.remove('is-revealing');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    void result.offsetWidth;
    result.classList.add('is-revealing');
  }
  if (scroll) result.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
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
  quiet: {day:'./assets/embankment.webp',night:'./assets/embankment-night.webp',alt:'Тихая набережная Светлоречья с мостом над водой'},
  nature: {day:'./assets/courtyard.webp',night:'./assets/courtyard-night.webp',alt:'Тенистый двор Светлоречья с зелёными воротами'},
  city: {day:'./assets/canal.webp',night:'./assets/canal-night.webp',alt:'Мощёная улица Светлоречья вдоль канала'}
};
const heroImage = document.querySelector('#hero-image');
const sceneButtons = [...document.querySelectorAll('[data-scene]')];
const timeButtons = [...document.querySelectorAll('[data-time-mode]')];
const cardImages = [...document.querySelectorAll('.card-photo img[data-night-src]')];
const nightCardCopy = [
  {alt:'Ночная набережная Светлоречья с освещённым мостом и отражениями фонарей'},
  {alt:'Зелёный двор Светлоречья с тёплым светом окон и фонарей',description:'Свернуть с привычной улицы туда, где шелестит листва и мягко светятся окна.'},
  {alt:'Освещённая фонарями улица Светлоречья вдоль канала',title:'Вечер у канала',description:'Замечать тёплый свет окон, маленькие мосты и город, который замедляется к ночи.'}
];
const cardCopies = [...document.querySelectorAll('.walk-card')].map(card => ({title:card.querySelector('h3').textContent,description:card.querySelector('p').textContent}));
let activeScene = 'quiet';
let timeMode = 'day';
let sceneRequest = 0;
let sceneTimer;
function updateHeroImage() {
  const request = ++sceneRequest;
  const image = sceneImages[activeScene];
  const target = image[timeMode];
  if (heroImage.getAttribute('src') === target) return;
  const preload = new Image();
  preload.onload = () => {
    if (request !== sceneRequest) return;
    clearTimeout(sceneTimer);
    heroImage.classList.add('is-changing');
    sceneTimer = setTimeout(() => {
      if (request !== sceneRequest) return;
      heroImage.src = target;
      heroImage.alt = `${image.alt}, ${timeMode === 'night' ? 'ночью' : 'днём'}`;
      heroImage.classList.remove('is-changing');
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180);
  };
  preload.src = target;
}
for (const button of sceneButtons) button.addEventListener('click',()=>{
  const scene = button.dataset.scene;
  for (const item of sceneButtons) {const active = item === button; item.classList.toggle('is-active',active); item.setAttribute('aria-pressed',String(active));}
  form.elements.namedItem('sound').value = scene;
  activeScene = scene;
  updateHeroImage();
});
for (const button of timeButtons) button.addEventListener('click',()=>{
  timeMode = button.dataset.timeMode;
  document.body.classList.toggle('night-mode',timeMode === 'night');
  for (const item of timeButtons) item.setAttribute('aria-pressed',String(item === button));
  for (const [index,image] of cardImages.entries()) {
    image.dataset.dayAlt ||= image.alt;
    image.src = image.dataset[`${timeMode}Src`];
    image.alt = timeMode === 'night' ? nightCardCopy[index].alt : image.dataset.dayAlt;
    const card = image.closest('.walk-card');
    card.querySelector('h3').textContent = timeMode === 'night' ? nightCardCopy[index].title || cardCopies[index].title : cardCopies[index].title;
    card.querySelector('p').textContent = timeMode === 'night' ? nightCardCopy[index].description || cardCopies[index].description : cardCopies[index].description;
  }
  updateHeroImage();
  if (!result.hidden) showResult({scroll:false});
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

