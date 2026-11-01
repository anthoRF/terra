export const ACTIVITY_IDS = ['discover', 'build', 'connect', 'challenge'];
export const SPHERES = ['atmosphere', 'hydrosphere', 'geosphere', 'biosphere'];
export const LAYERS = ['crust', 'mantle', 'core'];
export const ITEMS = {
  atmosphere: { name: 'Atmósfera', short: 'El aire que nos envuelve', color: '#8fbcd4', description: 'Es la envoltura de gases que rodea la Tierra. El aire que respiramos forma parte de ella.', fact: 'No es una capa del interior terrestre.', icon: 'wind' },
  hydrosphere: { name: 'Hidrósfera', short: 'Toda el agua del planeta', color: '#65b1dc', description: 'Reúne toda el agua de la Tierra: océanos, ríos, lagos, agua subterránea, hielo y vapor de agua.', fact: 'Un glaciar también forma parte de la hidrósfera.', icon: 'water' },
  geosphere: { name: 'Geósfera', short: 'La parte rocosa y metálica', color: '#c7aa80', description: 'Incluye las rocas de los continentes, el fondo de los océanos y el interior terrestre. Se organiza en corteza, manto y núcleo.', fact: 'No toda la geósfera es sólida: el núcleo externo es líquido.', icon: 'mountain' },
  biosphere: { name: 'Biósfera', short: 'La vida en la Tierra', color: '#9bbd85', description: 'Es el conjunto de los seres vivos del planeta. Se relaciona con el agua, el aire y el suelo.', fact: 'No es una franja del interior: la vida ocupa distintos ambientes.', icon: 'leaf' },
  crust: { name: 'Corteza', short: 'La capa más externa', color: '#b78b59', description: 'Es la capa más superficial y delgada de la geósfera. Está formada por rocas sólidas, tanto en los continentes como bajo los océanos.', fact: 'El fondo del océano también tiene corteza.', icon: 'layers' },
  mantle: { name: 'Manto', short: 'La capa intermedia', color: '#e77e44', description: 'Está entre la corteza y el núcleo. Está formado principalmente por roca sólida muy caliente.', fact: 'Sus rocas pueden deformarse muy lentamente. No es un océano de lava.', icon: 'layers' },
  core: { name: 'Núcleo', short: 'El centro de nuestro planeta', color: '#f3c55b', description: 'Es la capa más interna y está formada principalmente por metales. Tiene una parte externa líquida y otra interna sólida.', fact: 'El núcleo externo y el interno son dos partes de una misma capa principal.', icon: 'circle' },
  outerCore: { name: 'Núcleo externo', short: 'Una parte del núcleo', color: '#e9a63c', description: 'Rodea al núcleo interno. Está formado principalmente por hierro y níquel en estado líquido.', fact: 'El núcleo tiene dos partes: una externa líquida y otra interna sólida.', icon: 'circle' },
  innerCore: { name: 'Núcleo interno', short: 'La parte más profunda', color: '#f6d978', description: 'Está en el centro del planeta. Es sólido: la enorme presión ayuda a mantener sus metales en ese estado, aunque estén muy calientes.', fact: 'El núcleo tiene dos partes: una externa líquida y otra interna sólida.', icon: 'circle' },
};
export const ACTIVITIES = {
  discover: { title: 'Descubre', subtitle: 'Reconoce los componentes', total: 4, view: 'surface' },
  build: { title: 'Construye', subtitle: 'De la superficie al centro', total: 3, view: 'interior' },
  connect: { title: 'Relaciona', subtitle: 'La Tierra funciona en conjunto', total: 3, view: 'surface' },
  challenge: { title: 'Reto final', subtitle: 'Tu ficha científica', total: 7, view: 'surface' },
};
export const DISCOVER_QUESTIONS = [
  { prompt: '¿Qué componente reúne toda el agua de la Tierra?', answer: 'hydrosphere', hint: 'Piensa también en los ríos, el hielo y el agua subterránea.' },
  { prompt: '¿Cuál es la envoltura de gases del planeta?', answer: 'atmosphere', hint: 'El aire que nos rodea forma parte de ella.' },
  { prompt: '¿A qué componente pertenecen las rocas y el interior terrestre?', answer: 'geosphere', hint: 'Incluye el fondo de los océanos, no solo los continentes.' },
  { prompt: '¿Cómo se llama el conjunto de los seres vivos?', answer: 'biosphere', hint: 'La vida se encuentra en ambientes de agua, tierra y aire.' },
];
export const SCENES = [
  { id: 'fish', title: 'Un pez en el río', question: 'Relaciona el ser vivo y el agua en la que nada.', answers: ['biosphere', 'hydrosphere'], explanation: 'El pez es un ser vivo de la biósfera; el agua del río pertenece a la hidrósfera.' },
  { id: 'tree', title: 'Un árbol entre las rocas', question: 'Relaciona el árbol y el terreno rocoso.', answers: ['biosphere', 'geosphere'], explanation: 'El árbol es parte de la biósfera; las rocas pertenecen a la geósfera.' },
  { id: 'bird', title: 'Un ave atraviesa el aire', question: 'Relaciona el ser vivo y el aire por el que vuela.', answers: ['biosphere', 'atmosphere'], explanation: 'El ave pertenece a la biósfera; el aire es parte de la atmósfera.' },
];
export const CHALLENGE_LABELS = ['Gases que rodean la Tierra', 'Agua del planeta', 'Rocas e interior terrestre', 'Seres vivos'];
export const newDraft = (id) => id === 'discover' ? Array(4).fill(null) : id === 'build' ? [] : id === 'connect' ? [[], [], []] : { surface: Array(4).fill(null), inside: [], sentences: ['', ''] };
const sameSet = (a, b) => a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);
export function validateAnswers(id, input, complete = false) {
  const array = (v, max, allowed, min = 0, unique = false) => Array.isArray(v) && v.length >= min && v.length <= max && v.every(x => allowed.includes(x)) && (!unique || new Set(v).size === v.length);
  if (id === 'discover') {
    if (!array(input, 4, complete ? SPHERES : [...SPHERES, null], 4)) throw new Error('Completa las cuatro selecciones.');
    return [...input];
  }
  if (id === 'build') {
    if (!array(input, 3, LAYERS, complete ? 3 : 0, true)) throw new Error('Coloca las tres capas, sin repetirlas.');
    return [...input];
  }
  if (id === 'connect') {
    if (!Array.isArray(input) || input.length !== 3 || !input.every(v => array(v, 2, SPHERES, complete ? 2 : 0, true))) throw new Error('Selecciona dos componentes en cada escena.');
    return input.map(v => [...v]);
  }
  if (id === 'challenge') {
    if (!input || typeof input !== 'object') throw new Error('Completa tu ficha.');
    const surface = validateAnswers('discover', input.surface, false);
    if (complete && surface.some(v => v === null)) throw new Error('Asigna los cuatro componentes de la ficha.');
    const inside = validateAnswers('build', input.inside, complete);
    if (!Array.isArray(input.sentences) || input.sentences.length !== 2 || !input.sentences.every(s => typeof s === 'string' && s.length <= 280)) throw new Error('Escribe dos explicaciones de hasta 280 caracteres.');
    const sentences = input.sentences.map(s => s.trim());
    if (complete && !sentences.every(s => s.length >= 20 && /\p{L}/u.test(s))) throw new Error('Escribe al menos 20 caracteres en cada explicación.');
    return { surface, inside, sentences };
  }
  throw new Error('Actividad no válida.');
}
export function gradeActivity(id, input) {
  const answers = validateAnswers(id, input, true);
  let checks;
  if (id === 'discover') checks = DISCOVER_QUESTIONS.map((q, i) => ({ correct: answers[i] === q.answer, label: q.prompt, explanation: ITEMS[q.answer].description }));
  if (id === 'build') checks = LAYERS.map((layer, i) => ({ correct: answers[i] === layer, label: ['Más externa', 'Intermedia', 'Más interna'][i], explanation: `${ITEMS[layer].name}: ${ITEMS[layer].description}` }));
  if (id === 'connect') checks = SCENES.map((s, i) => ({ correct: sameSet(answers[i], s.answers), label: s.title, explanation: s.explanation }));
  if (id === 'challenge') checks = [...SPHERES.map((item, i) => ({ correct: answers.surface[i] === item, label: CHALLENGE_LABELS[i], explanation: ITEMS[item].description })), ...LAYERS.map((layer, i) => ({ correct: answers.inside[i] === layer, label: `Interior: ${['exterior', 'intermedio', 'centro'][i]}`, explanation: ITEMS[layer].description }))];
  return { score: checks.filter(c => c.correct).length, total: checks.length, checks, needsReview: id === 'challenge' };
}
export const SOURCES = [
  { title: 'Libro de Ciencias Naturales · 5.º EGB', detail: 'Ministerio de Educación del Ecuador / Editorial Don Bosco (2016). Unidad 4, apartado 3.6, p. 92. Las capas de la Tierra: componentes del planeta y estructura de la geósfera.' },
  { title: 'Currículo de EGB Media · CN.3.4.4', detail: 'Ministerio de Educación del Ecuador (2025). Referencia del subnivel; selección para quinto año apoyada en el libro.', url: 'https://educacion.gob.ec/wp-content/uploads/downloads/2025/08/Curriculo-Priorizado-EGB-Media.pdf' },
  { title: 'NASA · Facts About Earth', detail: 'Contraste de la estructura terrestre y de las dos partes del núcleo.', url: 'https://science.nasa.gov/earth/facts/' },
  { title: 'British Geological Survey · The structure of the Earth', detail: 'Contraste del estado predominantemente sólido del manto y su deformación lenta.', url: 'https://www.bgs.ac.uk/discovering-geology/earth-hazards/earthquakes/what-causes-earthquakes/' },
  { title: 'NOAA · Hydrosphere', detail: 'Contraste del agua terrestre en sus distintos estados.', url: 'https://www.noaa.gov/jetstream/appendix/weather-glossary-h' },
];
