export const moods = {
  breathe: { phrase: 'Не спешите. Сделайте паузу там, где захочется, и дайте мыслям идти своим ходом.' },
  focus: { phrase: 'Идите в удобном ритме. Выберите одну мысль и оставьте ей немного свободного пространства.' },
  inspire: { phrase: 'Присмотритесь к отражениям, цветам и деталям вокруг. Возможно, что-то привычное откроется по-новому.' }
};
export const surroundings = {
  quiet: { title: 'Вдоль тихой воды', label: 'Почти тишина', description: 'Уединённая дорожка вдоль реки, тихие переулки и скамейка с видом на воду.', stops: ['Ивовая пристань', 'Тихий переулок', 'Сад отражений', 'Каменный мост', 'Скамейка у воды'] },
  nature: { title: 'Дворы с зелёными воротами', label: 'Звуки природы', description: 'Зелёные дворы и небольшие сады, где городской фон уступает шелесту листьев и пению птиц.', stops: ['Зелёные ворота', 'Липовый двор', 'Яблоневый сад', 'Тропинка у ручья', 'Сквер старой ивы'] },
  city: { title: 'Утро у канала', label: 'Негромкая жизнь города', description: 'Светлые улицы вдоль канала, маленькие мосты и спокойный ритм просыпающегося города.', stops: ['Площадь фонаря', 'Улица цветных дверей', 'Малый канал', 'Мост пекарей', 'Солнечная набережная'] }
};
export function pickRoute({ mood = 'breathe', time = 40, sound = 'quiet' } = {}) {
  if (!Object.hasOwn(moods, mood) || !Object.hasOwn(surroundings, sound) || ![20,40,60].includes(Number(time))) throw new RangeError('Неизвестные параметры прогулки');
  const route = surroundings[sound];
  const count = {20:3,40:4,60:5}[time];
  return { title: route.title, time: Number(time), sound: route.label, description: `${route.description} ${moods[mood].phrase}`, stops: route.stops.slice(0, count) };
}
export const presets = { water: {mood:'breathe',time:40,sound:'quiet'}, garden: {mood:'focus',time:20,sound:'nature'}, canal: {mood:'inspire',time:60,sound:'city'} };
