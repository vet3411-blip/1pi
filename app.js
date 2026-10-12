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
  if (timeMode === button.dataset.timeMode) return;
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
    card.querySelector('.card-photo').setAttribute('aria-label',`Посмотреть маршрут ${card.querySelector('h3').textContent}`);
  }
  updateHeroImage();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const hero = document.querySelector('.hero');
    hero.classList.remove('is-time-shifting');
    void hero.offsetWidth;
    hero.classList.add('is-time-shifting');
  }
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

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealSelectors = ['.section-heading','.steps article','.finder-top','#walk-form','.walks-heading','.walk-card','.closing'];
  const targets = revealSelectors.flatMap(selector => [...document.querySelectorAll(selector)]);
  for (const selector of revealSelectors) {
    document.querySelectorAll(selector).forEach((element,index) => {
      element.classList.add('reveal-item');
      element.style.setProperty('--reveal-delay',`${Math.min(index,2) * 110}ms`);
    });
  }
  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  },{threshold:0.1,rootMargin:'0px 0px -32px 0px'});
  targets.forEach(target => observer.observe(target));
  reducedMotion.addEventListener('change',event => {
    if (!event.matches) return;
    observer.disconnect();
    document.body.classList.remove('motion-ready');
  },{once:true});
}

const carousel = document.querySelector('#walk-carousel');
const walkCards = [...carousel.querySelectorAll('.walk-card')];
const carouselCount = document.querySelector('#walk-carousel-count');
const motionToggle = document.querySelector('#walk-motion-toggle');
let activeWalk = 0;
let carouselVisible = false;
let carouselPaused = false;
let userPauseUntil = 0;
function updateCarouselCount() { carouselCount.textContent = `${String(activeWalk + 1).padStart(2,'0')} / ${String(walkCards.length).padStart(2,'0')}`; }
function moveCarousel(index, manual = false) {
  activeWalk = (index + walkCards.length) % walkCards.length;
  const target = walkCards[activeWalk].getBoundingClientRect().left - carousel.getBoundingClientRect().left + carousel.scrollLeft;
  carousel.scrollTo({left:target,behavior:reducedMotion.matches?'instant':'smooth'});
  if (manual) userPauseUntil = Date.now() + 12000;
  updateCarouselCount();
}
document.querySelector('#walk-prev').addEventListener('click',()=>moveCarousel(activeWalk - 1,true));
document.querySelector('#walk-next').addEventListener('click',()=>moveCarousel(activeWalk + 1,true));
carousel.addEventListener('keydown',event=>{
  if (event.target !== carousel || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  moveCarousel(activeWalk + (event.key === 'ArrowRight' ? 1 : -1),true);
});
carousel.addEventListener('pointerdown',()=>{userPauseUntil = Date.now() + 12000;});
carousel.addEventListener('scroll',()=>{
  let closest = 0, distance = Infinity;
  for (const [index,card] of walkCards.entries()) {
    const delta = Math.abs(card.getBoundingClientRect().left - carousel.getBoundingClientRect().left);
    if (delta < distance) { closest = index; distance = delta; }
  }
  if (closest !== activeWalk) {activeWalk = closest; updateCarouselCount();}
},{passive:true});
const walksSection = document.querySelector('#walks');
walksSection.addEventListener('mouseenter',()=>{carouselPaused = true;});
walksSection.addEventListener('mouseleave',()=>{carouselPaused = false;});
walksSection.addEventListener('focusin',()=>{carouselPaused = true;});
walksSection.addEventListener('focusout',event=>{if (!walksSection.contains(event.relatedTarget)) carouselPaused = false;});
motionToggle.addEventListener('click',()=>{
  const paused = motionToggle.getAttribute('aria-pressed') !== 'true';
  motionToggle.setAttribute('aria-pressed',String(paused));
  motionToggle.setAttribute('aria-label',paused?'Продолжить смену прогулок':'Остановить смену прогулок');
  motionToggle.innerHTML = paused ? '▶ <span>Продолжить</span>' : 'Ⅱ <span>Пауза</span>';
});
if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{carouselVisible = entries[0].isIntersecting;},{threshold:.3}).observe(walksSection);
else carouselVisible = true;
setInterval(()=>{
  if (carouselVisible && !carouselPaused && !reducedMotion.matches && motionToggle.getAttribute('aria-pressed') !== 'true' && Date.now() > userPauseUntil && !document.hidden && !document.querySelector('#route-dialog').open) moveCarousel(activeWalk + 1);
},5200);
if (reducedMotion.matches) motionToggle.hidden = true;
reducedMotion.addEventListener('change',event=>{motionToggle.hidden = event.matches;});

const routeDialog = document.querySelector('#route-dialog');
const dialogImage = document.querySelector('#route-dialog-image');
const dialogTitle = document.querySelector('#route-dialog-title');
const dialogDescription = document.querySelector('#route-dialog-description');
const dialogStops = document.querySelector('#route-dialog-stops');
let selectedPreset = 'water';
let returnFocus = null;
let chooseFromDialog = false;
function openRoutePreview(button) {
  selectedPreset = button.dataset.preview;
  const card = button.closest('.walk-card');
  const route = pickRoute(presets[selectedPreset]);
  const image = card.querySelector('.card-photo img');
  dialogImage.src = image.currentSrc || image.src;
  dialogImage.alt = image.alt;
  dialogTitle.textContent = card.querySelector('h3').textContent;
  dialogDescription.textContent = card.querySelector('p').textContent;
  document.querySelector('#route-dialog-time').textContent = `${route.time} минут`;
  document.querySelector('#route-dialog-sound').textContent = route.sound;
  dialogStops.replaceChildren(...route.stops.map((stop,index)=>{
    const item = document.createElement('li');
    const number = document.createElement('span'); number.textContent = String(index+1).padStart(2,'0');
    item.append(number,document.createTextNode(stop));
    return item;
  }));
  returnFocus = button;
  routeDialog.showModal();
}
document.querySelectorAll('[data-preview]').forEach(button=>button.addEventListener('click',()=>openRoutePreview(button)));
document.querySelector('#route-dialog-close').addEventListener('click',()=>routeDialog.close());
routeDialog.addEventListener('click',event=>{if (event.target === routeDialog) routeDialog.close();});
routeDialog.addEventListener('close',()=>{if (!chooseFromDialog) returnFocus?.focus(); chooseFromDialog = false;});
document.querySelector('#route-dialog-choose').addEventListener('click',()=>{
  chooseFromDialog = true;
  routeDialog.close();
  const preset = presets[selectedPreset];
  for (const [key,value] of Object.entries(preset)) form.elements.namedItem(key).value = String(value);
  sceneButtons.find(button=>button.dataset.scene === preset.sound)?.click();
  showResult();
});

