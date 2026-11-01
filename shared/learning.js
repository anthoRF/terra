// Lecturas originales: base escolar y contraste científico en docs/CONTENIDO_Y_DISENO.md.
export const LEARNING = {
  atmosphere: {
    material: 'Gases', location: 'Alrededor de la Tierra',
    sections: [
      ['Una envoltura que nos acompaña', 'La atmósfera rodea el planeta y se vuelve menos densa al alejarnos de la superficie. Contiene principalmente nitrógeno y oxígeno. Aunque no podamos verla como una roca, podemos sentir el aire cuando sopla el viento.'],
      ['Su relación con la vida', 'Nos proporciona el aire que respiramos y participa en las condiciones que permiten la vida. En su zona más baja se forman las nubes y ocurren fenómenos como la lluvia y el viento.'],
    ],
    example: 'Cuando una cometa se eleva por el viento, estás observando un efecto del aire de la atmósfera.',
    remember: 'Atmósfera significa gases. No pertenece al interior rocoso de la Tierra.',
    question: 'Si el aire no tiene un color visible, ¿cómo podrías demostrar que está ahí?',
  },
  hydrosphere: {
    material: 'Agua en sus tres estados', location: 'Océanos, tierra y aire',
    sections: [
      ['Mucho más que océanos', 'La hidrósfera reúne toda el agua del planeta. Incluye mares, ríos, lagos, aguas subterráneas, glaciares y vapor de agua. El agua puede ser líquida, sólida o gaseosa y seguir perteneciendo a este componente.'],
      ['El agua cambia de lugar', 'El calor del Sol favorece la evaporación. El vapor puede condensarse y el agua regresar como precipitación. Parte se acumula en la superficie y parte se infiltra en el suelo: así se relacionan agua, aire y terreno.'],
    ],
    example: 'El río Guayas y el hielo de un glaciar ecuatoriano forman parte de la misma hidrósfera, aunque el agua esté en estados diferentes.',
    remember: 'Una nube contiene pequeñas gotas de agua o cristales de hielo. El vapor de agua es un gas invisible.',
    question: '¿Una botella con hielo y un río contienen agua de un mismo componente?',
  },
  geosphere: {
    material: 'Rocas y metales', location: 'Desde la superficie al centro',
    sections: [
      ['El terreno y lo que hay debajo', 'La geósfera comprende los materiales rocosos y metálicos de la Tierra. Incluye las montañas, el fondo de los océanos y las capas profundas que no podemos observar directamente.'],
      ['Tres capas principales', 'Según su composición, distinguimos corteza, manto y núcleo. Esta clasificación ayuda a estudiar el interior. El núcleo se puede explorar con más detalle en sus partes externa e interna.'],
    ],
    example: 'Las rocas de los Andes y las que se encuentran bajo el océano Pacífico pertenecen a la geósfera.',
    remember: 'La geósfera no es completamente sólida: el núcleo externo es líquido.',
    question: '¿Qué cambia cuando pasamos de observar el paisaje a observar el corte del planeta?',
  },
  biosphere: {
    material: 'Seres vivos', location: 'Ambientes de tierra, agua y aire',
    sections: [
      ['La vida comparte el planeta', 'La biósfera reúne a los seres vivos y los ambientes donde existe vida. Incluye plantas, animales, hongos y microorganismos. No tiene la forma de una capa sólida alrededor del núcleo.'],
      ['Todo está relacionado', 'Una planta necesita agua, gases del aire y materiales del suelo. Un pez vive en el agua y depende de su ambiente. Estos ejemplos muestran que la biósfera se relaciona continuamente con los otros componentes.'],
    ],
    example: 'Un manglar de la costa ecuatoriana conecta seres vivos, agua, aire y terreno en un mismo lugar.',
    remember: 'El pez pertenece a la biósfera; el agua donde nada, a la hidrósfera.',
    question: 'En un jardín, ¿qué ejemplos puedes encontrar de los cuatro componentes?',
  },
  crust: {
    material: 'Roca sólida', location: 'La parte más externa de la geósfera',
    sections: [
      ['La superficie sobre la que vivimos', 'La corteza es la capa más delgada y externa de la geósfera. Está formada por rocas. En ella se encuentran los continentes y también el fondo de los océanos; el agua del océano queda por encima de la corteza oceánica.'],
      ['Dos tipos de corteza', 'La corteza continental forma los continentes y suele ser más gruesa. La corteza oceánica se encuentra bajo los océanos y suele ser más delgada. Ambas reposan sobre el manto.'],
    ],
    example: 'Las rocas que ves en una montaña pertenecen a la corteza. La capa de suelo donde crecen plantas se desarrolla sobre materiales de esa superficie.',
    remember: 'Corteza no significa solo suelo: también incluye las rocas bajo los continentes y océanos.',
    question: 'Si descendieras desde el fondo del océano, ¿qué capa interna encontrarías primero?',
  },
  mantle: {
    material: 'Roca principalmente sólida y caliente', location: 'Entre la corteza y el núcleo',
    sections: [
      ['La gran capa intermedia', 'El manto se encuentra debajo de la corteza y rodea el núcleo. Es una capa muy gruesa, formada sobre todo por rocas calientes. En el corte puedes reconocerlo por su posición intermedia.'],
      ['Sólido, pero capaz de cambiar', 'Sus rocas son principalmente sólidas. Bajo las condiciones del interior pueden deformarse y fluir muy lentamente durante tiempos geológicos. Esto no significa que todo el manto sea líquido.'],
    ],
    example: 'Los colores cálidos del corte te ayudan a distinguir el manto. Su color real no se puede deducir del dibujo: aquí importa reconocer su lugar y su material.',
    remember: 'El manto no es un océano de lava. El magma es roca fundida que aparece en zonas concretas.',
    question: '¿Qué dos capas quedan a cada lado del manto?',
  },
  core: {
    material: 'Principalmente hierro y níquel', location: 'La región central',
    sections: [
      ['Un centro metálico', 'El núcleo es la capa más interna de la Tierra. A diferencia de las capas rocosas que lo rodean, está formado principalmente por metales, especialmente hierro y níquel.'],
      ['Dos partes con estados distintos', 'El núcleo externo es líquido y rodea al núcleo interno, que es sólido. Ambos están muy calientes. La enorme presión del centro contribuye a mantener sólido al núcleo interno.'],
    ],
    example: 'En el modelo, el núcleo ocupa el centro. Para llegar a él desde la superficie primero atravesarías la corteza y después el manto.',
    remember: 'Núcleo externo e interno son dos partes del núcleo, una de las tres capas principales.',
    question: '¿Cómo puede haber una parte sólida y otra líquida dentro de una misma capa principal?',
  },
  outerCore: {
    material: 'Metales líquidos', location: 'Entre el manto y el núcleo interno',
    sections: [
      ['La parte líquida del núcleo', 'El núcleo externo rodea al interno y está compuesto principalmente por hierro y níquel líquidos. El movimiento de sus materiales ayuda a generar el campo magnético terrestre.'],
      ['Cómo lo estudiamos', 'Las ondas de los terremotos aportan pistas sobre el interior. Su comportamiento al atravesar distintas regiones permite a los científicos estudiar materiales y distinguir zonas sólidas de zonas líquidas.'],
    ],
    example: 'Una brújula se orienta gracias al campo magnético de la Tierra. Ese campo se relaciona con procesos que ocurren muy lejos de la superficie.',
    remember: 'Externo significa que rodea al núcleo interno; sigue estando en el interior profundo de la Tierra.',
    question: '¿Por qué «núcleo externo» no significa que esté fuera del planeta?',
  },
  innerCore: {
    material: 'Metales sólidos', location: 'En el centro de la Tierra',
    sections: [
      ['El centro más profundo', 'El núcleo interno es la parte central del núcleo. Está formado principalmente por hierro y níquel en estado sólido, aunque su temperatura es muy elevada.'],
      ['El papel de la presión', 'El estado de un material no depende solo de la temperatura. En el centro terrestre, la enorme presión favorece que los metales permanezcan sólidos. El núcleo externo, que lo rodea, es líquido.'],
    ],
    example: 'En el corte, observa la región central y la que la rodea: juntas forman el núcleo, pero sus materiales se encuentran en estados distintos.',
    remember: 'Muy caliente no siempre significa líquido: la presión también influye.',
    question: '¿Qué diferencia principal hay entre el núcleo interno y el externo?',
  },
};

export const ACTIVITY_GUIDES = {
  discover: { description: 'Reconoce el aire, el agua, las rocas y la vida del planeta.', product: '4 preguntas · una elección en cada una', steps: ['Lee la pregunta y observa la superficie.', 'Elige un componente y pasa a la siguiente pregunta.', 'Comprueba tus cuatro respuestas al terminar.'] },
  build: { description: 'Ordena las capas de la geósfera desde afuera hacia adentro.', product: '3 capas · un orden completo', steps: ['Pulsa una pieza para añadirla a la primera posición libre.', 'Usa las flechas si necesitas cambiar su lugar.', 'Comprueba el orden cuando hayas colocado las tres.'] },
  connect: { description: 'Encuentra qué componentes se relacionan en cada escena.', product: '3 escenas · dos elecciones por escena', steps: ['Observa los dos elementos que menciona cada escena.', 'Marca sus dos componentes. Pulsa de nuevo para desmarcar.', 'Completa las tres escenas y comprueba tus relaciones.'] },
  challenge: { description: 'Crea una ficha que explique la Tierra a otro curso.', product: '3 partes · una ficha imprimible', steps: ['Relaciona las cuatro descripciones con sus componentes.', 'Ordena las capas del interior.', 'Escribe dos explicaciones propias y entrega tu ficha.'] },
};

export const QUICK_CHECKS = {
  atmosphere: { statement:'El aire que respiramos pertenece a la atmósfera.', answer:true, explanation:'La atmósfera es la envoltura de gases del planeta.' },
  hydrosphere: { statement:'El hielo de un glaciar también forma parte de la hidrósfera.', answer:true, explanation:'El agua pertenece a la hidrósfera en estado líquido, sólido o gaseoso.' },
  geosphere: { statement:'Toda la geósfera es sólida.', answer:false, explanation:'La geósfera incluye el núcleo externo, que es líquido.' },
  biosphere: { statement:'Un pez pertenece a la hidrósfera porque vive en el agua.', answer:false, explanation:'El pez pertenece a la biósfera; el agua donde nada, a la hidrósfera.' },
  crust: { statement:'También hay corteza debajo de los océanos.', answer:true, explanation:'La corteza oceánica forma el fondo rocoso bajo el agua.' },
  mantle: { statement:'El manto es un gran océano de lava.', answer:false, explanation:'Está formado principalmente por roca sólida caliente que puede deformarse muy lentamente.' },
  core: { statement:'El núcleo tiene una parte líquida y otra sólida.', answer:true, explanation:'El núcleo externo es líquido y el interno es sólido.' },
  outerCore: { statement:'El núcleo externo está fuera de la Tierra.', answer:false, explanation:'Está en el interior profundo, entre el manto y el núcleo interno.' },
  innerCore: { statement:'El núcleo interno es sólido aunque está muy caliente.', answer:true, explanation:'La enorme presión ayuda a mantener sólidos sus metales.' },
};
