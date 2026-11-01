# Contenido y diseño de Terra

## Base escolar

Libro aportado: Ministerio de Educación del Ecuador / Editorial Don Bosco (2016), Ciencias Naturales 5 EGB, serie Ingenios. Unidad 4, «El universo y el planeta Tierra», apartado 3.6, «Las capas de la Tierra», página impresa 92 (página 95 del PDF). El objetivo relacionado aparece en la p. 5 y la destreza en la p. 7.

Referencia oficial contrastada: CN.3.4.4, diferenciación de las capas mediante modelos y componentes, del Currículo priorizado de EGB Media (2025). La selección para quinto año se apoya en el libro. I.CN.3.10.1 tiene un alcance mayor que esta aplicación: Terra trabaja su componente sobre capas y componentes, sin evaluar todo el indicador.

Fuente: https://educacion.gob.ec/wp-content/uploads/downloads/2025/08/Curriculo-Priorizado-EGB-Media.pdf

## Objetivo

Diferenciar los componentes del planeta y las capas internas de la geósfera mediante la exploración de un modelo interactivo, para elaborar una representación explicativa de la estructura terrestre.

| Objetivo observable | Actividad | Evidencia |
| --- | --- | --- |
| Identificar atmósfera, hidrósfera, geósfera y biósfera por sus componentes. | Descubre: cuatro selecciones. | Respuestas e historial. |
| Ordenar corteza, manto y núcleo de afuera hacia adentro. | Construye: colocar y reordenar. | Orden enviado e intentos. |
| Relacionar componentes en escenas concretas. | Relaciona: pez/río, árbol/rocas, ave/aire. | Tres asociaciones de dos componentes. |
| Integrar lo observado en una explicación para otro curso. | Reto: cuatro etiquetas, tres posiciones y dos frases. | Ficha imprimible y explicaciones para revisión docente. |

## Decisiones científicas

- Los componentes del sistema terrestre no se presentan como equivalentes a las capas concéntricas del interior.
- La biósfera se relaciona con los seres vivos de diferentes ambientes. No se añade como una esfera sólida del corte.
- La geósfera incluye roca y metales del interior: se evita generalizar que toda ella es sólida, porque el núcleo externo es líquido.
- El contenido escolar principal es corteza, manto y núcleo. La distinción externo/interno del núcleo se presenta al explorar la ficha del núcleo, como ampliación.
- El manto se describe como principalmente sólido y capaz de deformarse muy lentamente. Sus tonos cálidos no significan que sea un océano de magma.
- Colores, grosores y proyecciones están simplificados. No se muestran temperaturas o profundidades sin necesidad pedagógica. No se simulan procesos físicos.

Contrastes independientes, consultados el 31 de octubre de 2026:

1. NASA. *Facts About Earth*: estructura general y núcleo. https://science.nasa.gov/earth/facts/
2. British Geological Survey. *What causes earthquakes?*, sección sobre estructura: estado del manto. https://www.bgs.ac.uk/discovering-geology/earth-hazards/earthquakes/what-causes-earthquakes/
3. NOAA. *Weather Glossary: H’s*, Hydrosphere: agua en distintos estados. https://www.noaa.gov/jetstream/appendix/weather-glossary-h

Las descripciones divulgativas de las fuentes tienen simplificaciones diferentes. Para el estado del manto se priorizó la explicación de BGS; para el núcleo, la de NASA. No se copiaron las cifras ni todas las afirmaciones de las infografías aportadas.

## Secuencia y evaluación

Inicio y misión breve, exploración libre, tres puntos, reto y cierre. Tiempo de clase estimado: 35–40 minutos, pendiente de ajustar mediante pilotaje. El botón de una capa lleva al punto relacionado; el recorrido inferior permite comenzar por Descubre y avanzar. Se permite explorar sin bloquear el acceso a los otros puntos.

Cada pregunta conserva la selección al retroceder. La comprobación es una acción explícita. Las asociaciones y el orden se pueden corregir sin arrastrar. Abrir una ficha no cuenta como completar una actividad. El primer intento y los reintentos se conservan como registros distintos.

El reto es un microproyecto: construir una ficha para explicar el planeta a otro curso. La evaluación automática comprueba cuatro identificaciones y tres posiciones. Las dos explicaciones se conservan para que el docente las revise personalmente; no reciben una puntuación lingüística automática. Solo una ficha con las siete selecciones correctas habilita la vista de impresión, manteniendo la revisión humana del texto.

Relación con las TAC: el modelo se utiliza para observar y comparar; la retroalimentación guía la revisión y el producto permite comunicar lo aprendido. Relación con proyectos: pregunta orientadora, exploración, construcción de un producto y explicación a un destinatario. Un ABP más extenso requeriría más sesiones, investigación y presentación real.

## Accesibilidad y diseño

Una escena principal oscura dentro de una interfaz clara, controles breves y fichas de lectura. Navegación Explorar / Actividades / Mi avance y desplazamiento normal de página. Fuente local Nunito Sans; las licencias de las fuentes originales se conservan. Navegación por teclado, etiquetas accesibles, foco visible, diálogos nativos, alternativa al arrastre y respeto al movimiento reducido. El diseño se reorganiza en columna en pantallas estrechas.

WebGL es la primera opción; la proyección por software mantiene la misma geometría y cámara cuando WebGL no está disponible. La vista ilustrada ofrece otra representación de los mismos conceptos y utiliza las mismas actividades y los mismos datos. No se declara conformidad WCAG completa ni compatibilidad con todos los dispositivos.

## Privacidad y límites

Alias y código personal generado en el servidor. No se necesitan correo, teléfono ni nombre completo. El código se guarda como derivación scrypt con sal. Sesiones HttpOnly y SameSite, Secure en producción, autorización por rol, caducidad y validación de respuestas en el servidor. Las escrituras de cada participante utilizan controles de revisión/ETag.

El docente usa una clave privada de entorno para esta instalación, gestiona varias clases y puede exportar resultados, restablecer códigos o eliminar participantes. No hay notas ni gráficos precargados.

## Revisión 1.1.0

Se incorporan lecturas originales ampliadas en shared/learning.js, ejemplos cercanos y orientación por actividad. Se vuelven a consultar NASA, BGS y NOAA el 31 de octubre de 2026. El libro y la guía no se recibieron de nuevo: su contenido se conserva según el análisis documentado de la versión anterior. El docente puede comentar las explicaciones de cada ficha y el estudiante recuperar ese comentario; la puntuación automática sigue limitada a las selecciones.

## Revisión 1.2.0

El código de clase deja de ser un requisito de acceso. Registro con alias e ingreso con alias y código personal. Los grupos docentes siguen siendo opcionales mediante enlaces. Las fichas incorporan práctica de verdadero/falso con explicación: no se guarda como intento ni se cuenta como calificación. La interacción con mouse y rueda se activa de forma explícita para conservar el desplazamiento normal fuera de ese modo. Las comprobaciones concretas están en VERIFICACION.md.
