# Registro real de desarrollo

Fecha: 31 de octubre de 2026. Esta nota registra decisiones de la construcción y distingue las comprobaciones técnicas del pilotaje y de la revisión humana que siguen pendientes.

## Entradas de trabajo

- Archivo de requisitos aportado: «Markdown pegado.md».
- Libro de Ciencias Naturales de quinto EGB y guía G003-S10 de TIC aplicada a la educación.
- Dos infografías aportadas como referencia de composición y del corte terrestre.
- Propuesta pedagógica y visual presentada en la conversación, seguida de una maqueta generada con IA.
- Instrucción de construcción del usuario: «SI, ME PARECE BASTANTE BIEN AHORA SI HAZLO ASI Y MEJOR PERFECTAMENTE SI TIENES ALGUNA DUDA ANTES DE EMPEZAR PREGUNTAMELO PARA QUE ME ENTREGUES EL PROYECTO BIEN A LA PRIMERA XFAVOR».

## Iteraciones técnicas observadas

| Iteración | Resultado observado | Decisión y cambio |
| --- | --- | --- |
| Primera implementación | Compilación de la interfaz y 11 pruebas del servidor superadas. | Separar modelo, actividades y datos; conservar las respuestas y calcular resultados en servidor. |
| Compatibilidad gráfica | El navegador de revisión devolvió WebGL desactivado; se mostró la vista ilustrada. | Añadir una proyección 3D por software, usando las mismas geometrías y cámara, sin eliminar la alternativa ilustrada. |
| Profundidad y textura | La primera proyección por software mostró problemas de oclusión. | Sustituir el pintado por orden de triángulos por un rasterizador con búfer de profundidad y coordenadas de textura corregidas. |
| Envío de actividades | El navegador HTTP de revisión no ofreció crypto.randomUUID. | Añadir generación de identificadores con getRandomValues, manteniendo las credenciales en el servidor. |
| Ancho reducido | Se observó la composición a 390 px y se detectaron controles cuyo texto quedaba oculto. | Añadir nombres accesibles explícitos y mantener el modelo en vistas embebidas o inicialmente ocultas. |
| Publicación | La CLI instalada construye automáticamente al desplegar. | Ajustar el comando de publicación a `netlify deploy --prod` y verificar el empaquetado real de la función y su ruta. |

Estas son iteraciones de implementación verificables mediante el código y las pruebas. No se presentan como tres pilotajes ni como tres intervenciones humanas de prompting. Esta nota no reproduce todas las respuestas del chat ni sustituye la bitácora académica final.

## Uso de IA e intervención humana

Codex se utilizó para análisis, programación, textos iniciales y comprobaciones técnicas. La maqueta visual se generó con IA; no se utiliza como mapa geográfico ni como evidencia científica. La textura terrestre procede de NASA y tiene créditos conservados.

La participación humana verificable en esta conversación consiste en los requisitos, las referencias visuales y la aprobación de la propuesta. La revisión personal del contenido final, las pruebas con tres usuarios y las mejoras derivadas deberán registrarse cuando se realicen. No se han inventado testimonios, firmas ni resultados.

## Auditoría ética inicial

- **Exactitud:** contenido contrastado con tres instituciones; las fuentes y simplificaciones se indican en CONTENIDO_Y_DISENO.md.
- **Privacidad:** alias y códigos; sin solicitud de correo, teléfono o nombre completo. Permisos y evaluación en servidor.
- **Autoría:** declaración breve en Fuentes; procedencia y licencias de los recursos conservadas.
- **Inclusión:** alternativa ilustrada, teclado, toque, texto equivalente y movimiento reducido.
- **Transparencia:** no se presentan resultados de muestra como datos de estudiantes ni revisión automática de textos como juicio docente.

Riesgos y mitigaciones: confusión del manto con lava → formulación y colores identificados como esquemáticos; exposición de progreso → sesiones y autorización en servidor; exclusión por gráficos → proyección por software y vista ilustrada; uso de IA sin revisión pedagógica → revisión humana y pilotaje pendientes expresamente documentados.

## Continuidad 1.1.0

Se recuperó el enlace compartido y se aplicó la nueva petición de reducir dificultad de scroll y aspecto infantil. Se reorganizaron navegación y lecturas, se aclararon actividades y acceso y se añadieron filtros y comentarios docentes. Se retiraron de la interfaz los mensajes de instalación y de desarrollo, conservando esta documentación. Se comprobó el servidor con 15 pruebas, la compilación y el renderizado de los pasos. La revisión visual de escritorio comenzó correctamente, pero la vista previa alternó con otra aplicación; no se atribuye una verificación móvil ni un recorrido completo a esta versión.

## Continuidad 1.2.0

Nueva petición del usuario: reducir flechas, eliminar el campo de código de clase, permitir mouse y rueda junto con botones y hacer las fichas más didácticas. Se implementó grupo automático, recuperación compatible de cuentas anteriores, modo de interacción explícito y práctica breve en cada ficha. Pasaron 17 pruebas. Se observaron mouse, rueda, ficha y formularios en navegador, y diseño estrecho sin desbordamiento. La publicación en Netlify del usuario y el pilotaje humano siguen pendientes.
