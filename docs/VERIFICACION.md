# Verificación de Terra 1.2.0

Revisión realizada el 31 de octubre de 2026, hora de Ecuador. Entorno: Linux, Node.js 24.22.1. Requisito del proyecto: Node.js 22.13 o superior.

| Comprobación | Resultado y alcance |
| --- | --- |
| `npm test` | 17 pruebas aprobadas, sin fallos ni omitidas. |
| `npm run build` | Interfaz de producción compilada. |
| `npm run build:functions` | API empaquetada por Netlify CLI con ruta `/api/*`. |
| Acceso sin clase | Registro directo con alias, creación concurrente del grupo automático, ingreso, cierre de registros y consulta docente comprobados programáticamente. |
| Compatibilidad anterior | Mismo alias en un grupo anterior y en el grupo automático: cada código recupera su cuenta y progreso. Restablecimiento conservando datos comprobado. |
| Seguridad y guardado | Se conservan las pruebas de cookies, roles, origen, derivación de códigos, caducidad, concurrencia, idempotencia, historial, revisión y CSV. |
| Fichas | En navegador se seleccionó Pruébate y una respuesta; apareció la explicación correspondiente. |
| Mouse | Botón Usar mouse, zoom con rueda y giro por arrastre observados. El zoom modificó las etiquetas proyectadas sin desplazar la página. Esc desactivó el modo. |
| Vista estrecha | Iframe de 390 px; área útil de 375 px por la barra de scroll. Sin desbordamiento horizontal. Los ocho controles del modelo cabían dentro del área útil. |
| Scroll normal | Fuera del modo interactivo, rueda sobre la Tierra en el iframe: el documento se desplazó a 936 px. |
| Formularios | En vista estrecha se inspeccionaron ingreso y registro: dos campos y uno, respectivamente. No se pide código de clase. No se introdujeron credenciales reales ni se creó una cuenta de usuario en el navegador. |

Las 17 pruebas incluyen las 15 verificaciones de la versión anterior y dos pruebas nuevas de registro automático y compatibilidad de acceso sin clase. Los datos de prueba son temporales y no se incluyen en el ZIP.

La revisión de 390 px es una comprobación de diseño, no una prueba en hardware móvil ni una certificación WCAG. No se verificó la salida WebGL en hardware con aceleración gráfica; el modelo por software funcionó en la revisión.

No se desplegó en la cuenta Netlify del usuario. Quedan por comprobar en esa cuenta las variables de producción, el acceso HTTPS, el almacenamiento Netlify Blobs real, la recuperación desde otro dispositivo y la exportación. Los asistentes Windows no se ejecutaron en una computadora Windows física.

La revisión pedagógica del responsable y el pilotaje real con tres usuarios siguen pendientes. No se atribuyen a usuarios reales las pruebas técnicas de desarrollo.
