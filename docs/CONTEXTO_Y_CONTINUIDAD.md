# Terra: contexto recuperado y continuidad

**Estado vigente: 1.2.0.** La nueva solicitud elimina el código de clase de registro e ingreso, reduce flechas y añade mouse/rueda junto con botones. Los participantes nuevos se agrupan automáticamente. Las fichas incorporan práctica breve. Estas decisiones sustituyen las anteriores en los apartados históricos que siguen. Detalle: CAMBIOS_1_2_0.md y README.md.

## Fuentes disponibles en esta revisión

Se recuperó el contenido de la conversación compartida «Diseño Tierra Interactiva», https://chatgpt.com/share/6ae679a9-36b0-83e9-8253-b94ae6743d9d, y se revisaron los archivos del ZIP Terra_Proyecto_Netlify_1_0_0.zip. Este documento reúne sus decisiones relevantes y la nueva solicitud. Los PDF del libro y de la guía se describen según el análisis recuperado y la documentación del proyecto: no se recibieron de nuevo en esta sesión.

## Propósito y público

Plataforma en español para Ciencias Naturales, quinto EGB de Ecuador. Tema: componentes del planeta e interior de la geósfera. El estudiante explora un modelo, completa tres actividades y construye una ficha para explicar la Tierra a otro curso. El diseño debe ser accesible para niños y visualmente sobrio.

Base escolar consignada: Ministerio de Educación del Ecuador / Editorial Don Bosco (2016), Ciencias Naturales 5 EGB, unidad 4 «El universo y el planeta Tierra», apartado 3.6 «Las capas de la Tierra», p. impresa 92 (p. 95 del PDF). Referencia curricular CN.3.4.4 del subnivel EGB Media. El recurso trabaja el componente de capas de I.CN.3.10.1; no evalúa todo ese indicador.

Objetivo: diferenciar los componentes del planeta y las capas internas de la geósfera mediante la exploración de un modelo interactivo, para elaborar una representación explicativa de la estructura terrestre.

## Contenido que se conserva

| Mirada | Conceptos | Precisión necesaria |
| --- | --- | --- |
| Componentes del planeta | Atmósfera, hidrósfera, geósfera y biósfera | La biósfera no es una franja sólida del interior. |
| Interior de la geósfera | Corteza, manto y núcleo | Son las tres capas principales por composición. |
| Ampliación | Núcleo externo e interno | Son partes del núcleo: líquido y sólido, respectivamente. |
| Material del manto | Rocas principalmente sólidas y calientes | Pueden deformarse muy lentamente; no es un océano de lava. |
| Agua terrestre | Agua líquida, hielo y vapor de agua | No limitar la hidrósfera a los océanos. |

Los colores y los grosores son esquemáticos. El modelo sirve para explorar relaciones espaciales, no representa una simulación física. Se conserva el aviso breve sobre proporciones y la alternativa ilustrada.

## Secuencia y evaluación

Duración inicial de referencia: 35–40 minutos, pendiente de ajustar con el pilotaje.

| Momento | Acción | Evidencia |
| --- | --- | --- |
| Inicio | Conocer el propósito de la ficha | Orientación breve en la sección de actividades. |
| Exploración | Seleccionar componentes y capas, cambiar la vista y leer | Interacción libre; abrir fichas no otorga calificación. |
| Descubre | Elegir el componente correspondiente a cuatro preguntas | Cuatro selecciones e intentos separados. |
| Construye | Ordenar corteza, manto y núcleo | Tres posiciones, corregibles con botones. |
| Relaciona | Identificar dos componentes en cada una de tres escenas | Asociaciones pez/agua, árbol/rocas y ave/aire. |
| Reto | Cuatro identificaciones, tres posiciones y dos explicaciones | Ficha imprimible y textos originales del estudiante. |
| Cierre | Consultar resultados, revisar y volver a practicar | Sección Mi avance y comentarios docentes. |

La evaluación automática se aplica a selecciones y posiciones. Las explicaciones reciben revisión humana. Se conserva el primer intento y los reintentos. La ficha se habilita para imprimir cuando las siete selecciones son correctas.

El uso de TAC se concreta en observar, comparar, comprobar y comunicar. El producto es un microproyecto de aula; no se presenta como un ABP extenso de varias sesiones.

## Acceso y persistencia

- Estudiantes: código de clase, alias y código personal secreto. No requieren correo, teléfono ni nombre completo.
- Registro: el servidor genera el código personal; se muestra para guardarlo o descargarlo. No se almacena en texto claro.
- Cuentas: el progreso se recupera desde el servidor. La exploración de invitado queda en ese dispositivo y no se transfiere automáticamente.
- Docente: clave privada del servidor. Puede crear clases, compartir código o enlace, cerrar inscripciones, consultar intentos, restablecer códigos y exportar CSV.
- Datos reales: el panel no contiene alumnos, calificaciones ni porcentajes de ejemplo.
- Seguridad conservada: derivación scrypt con sal, cookies HttpOnly y SameSite, Secure en producción, roles verificados en servidor, caducidad de sesiones y control de revisiones de borradores.

## Arquitectura que debe mantenerse

React + Vite, Three.js, Netlify Functions y Netlify Blobs. Fuentes e imágenes esenciales locales. Entrega con fuentes, compilación, dependencias fijadas, configuración Netlify, asistentes Windows e instrucciones. El servidor debe desplegarse junto con la interfaz: arrastrar solo dist no completa las cuentas y el guardado. La clave DOCENTE_CLAVE se configura como variable privada de Functions, nunca como VITE_. No se ha publicado en la cuenta del usuario durante esta revisión.

## Nueva solicitud aplicada en 1.1.0

La última petición pide simplificar el scroll, reducir el aspecto infantil, añadir contenido útil de cada capa, aclarar las actividades, mejorar acceso y panel docente y retirar mensajes de instalación o desarrollo de las pantallas del estudiante.

Respuesta implementada:

1. Navegación principal Explorar / Actividades / Mi avance.
2. Una página con desplazamiento normal; las fichas ya no tienen un scroll independiente.
3. Zoom mediante botones y gestos verticales reservados al desplazamiento de la página.
4. Diseño claro con verde grisáceo, blanco cálido, acento cobre y área oscura para el modelo; tipografía y bordes más sobrios.
5. Material y ubicación de cada capa, lecturas ampliadas, ejemplos, preguntas y comparación de las dos miradas del planeta.
6. Actividades con instrucciones numeradas y tareas explícitas. En pantallas estrechas la tarea aparece antes que el modelo de consulta.
7. Acceso con roles distinguibles, ayuda junto a los campos, invitaciones con clase completada y descarga del código personal.
8. Panel con resumen real, filtros, búsqueda, ordenación, invitaciones y avance por estudiante.
9. Revisión docente persistente de las explicaciones, comentarios visibles en la cuenta del estudiante y exportados al CSV.
10. Mensajes técnicos retirados de la plataforma. La instalación, la documentación de autoría y el uso de IA se conservan en los documentos de la entrega.

## Requisitos académicos pendientes

Según la conversación recuperada, la guía pide guion y reporte de pilotaje, tres pruebas con usuarios, dos mejoras derivadas de esas pruebas, prompt completo y tres iteraciones, contraste con tres fuentes, auditoría ética y edición humana. La rúbrica consignada distribuye 10 puntos: presentación 2; cumplimiento 2; contenido pedagógico 1,5; funcionamiento y evidencias 1,5; diseño 1; uso responsable de IA 1; redacción 1.

Las mejoras de este desarrollo son iteraciones técnicas, no tres pilotajes humanos. No inventar entrevistas, opiniones, firmas ni resultados. Falta realizar y documentar el pilotaje real, la revisión pedagógica del responsable y la comprobación en la cuenta Netlify publicada. Consultar VERIFICACION.md para distinguir lo probado de lo pendiente.
