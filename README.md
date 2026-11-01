# Terra 1.2.0 · Explora la Tierra

Plataforma de Ciencias Naturales para quinto EGB. Incluye modelo 3D, alternativa ilustrada, lecturas, práctica en las fichas, tres actividades, ficha final imprimible, cuentas y revisión docente. Preparada para publicar interfaz, funciones y almacenamiento en Netlify. No se ha desplegado en la cuenta del usuario desde esta entrega.

## Abrir en tu computadora

1. Descomprime todo el ZIP y entra en la carpeta **Terra**.
2. Instala Node.js 22.13 o superior si todavía no lo tienes.
3. En Windows, abre **INICIAR_WINDOWS.bat** y deja abierta su ventana.

También puedes abrir una terminal en esa carpeta y ejecutar:

```sh
npm ci
npm run dev
```

La primera ejecución genera una clave docente local en el archivo privado `.env`. Abre ese archivo para consultarla. Los datos locales se guardan en `.terra-data/`. No subas ninguna de esas dos cosas a Git ni a Netlify.

## Publicar en Netlify

La publicación debe incluir las funciones y la interfaz. **Arrastrar solo `dist/` o el ZIP al panel no publica las cuentas ni el guardado.**

La opción más directa en Windows es abrir **PUBLICAR_WINDOWS.bat**. El asistente instala las dependencias, abre el inicio de sesión de Netlify y vincula la carpeta a un sitio.

Antes de confirmar la publicación:

1. En el sitio de Netlify, abre **Project configuration → Environment variables**.
2. Crea `DOCENTE_CLAVE` con una clave privada de al menos 16 caracteres. Selecciona el contexto de producción y alcance **Functions**, o todos los alcances si tu cuenta no ofrece esa selección.
3. Guarda y continúa el asistente. Esa será la clave para entrar en **Docentes**. La clave local no se copia a Netlify automáticamente.

Si prefieres la terminal, desde la carpeta que contiene `package.json` y `netlify.toml`:

```sh
npm ci
npx netlify login
npx netlify sites:create
```

Configura la variable privada indicada y ejecuta:

```sh
npm run deploy
```

Si el sitio ya existe, utiliza `npx netlify link` en lugar de `sites:create`. El comando de publicación construye la interfaz y empaqueta la función de servidor.

También puedes importar un repositorio en Netlify. Configuración: comando **npm run build**, carpeta **dist**, funciones **netlify/functions**. Conserva `netlify.toml`. El almacenamiento Netlify Blobs es utilizado por la función; no necesitas crear una base de datos en otro servicio. El uso queda sujeto a los límites de la cuenta Netlify.

## Acceso sencillo

- **Cuenta nueva:** Ingresar → Crear mi acceso → escribir un alias. El servidor entrega un código personal que se puede descargar.
- **Volver a entrar:** alias y código personal. No se pide código de clase, correo ni confirmación por correo.
- **Docente:** entrar con `DOCENTE_CLAVE`. Los nuevos registros aparecen automáticamente en **Participantes de Terra**; no hace falta crear una clase primero.
- **Grupos opcionales:** el docente puede crear un grupo y compartir su enlace de invitación. El estudiante tampoco escribe códigos al utilizar ese enlace.
- **Cuentas anteriores:** conservan progreso e intentos. Se puede ingresar con alias y código personal sin introducir la clase anterior.
- **Código perdido:** el docente puede restablecerlo conservando las actividades.

Los códigos personales se almacenan con derivación criptográfica, no en texto claro. La clave docente nunca se incluye en el cliente ni usa el prefijo `VITE_`.

## Usar el modelo

Haz clic en la Tierra o pulsa **Usar mouse**. Arrastra para girar y utiliza la rueda para acercar o alejar. Para volver al desplazamiento de la página, pulsa **Terminar**, **Esc** o fuera del modelo. Los botones de giro, zoom y restablecimiento siguen disponibles. En pantalla táctil, activa el modo para girar y ampliar; fuera de ese modo puedes deslizar la página.

Las fichas tienen **Lo esencial / Un ejemplo / Pruébate**. La práctica breve de las fichas ayuda a comprender y no suma notas ni intentos oficiales. Las actividades y el reto están en su sección correspondiente.

## Progreso y revisión

El servidor conserva borradores, primer intento y reintentos. El docente puede buscar, filtrar, consultar respuestas, comentar explicaciones y exportar CSV. En **Mi avance → Actualizar mi avance**, el estudiante recupera comentarios recientes. El modo invitado guarda por separado en ese navegador; no transfiere automáticamente el progreso a una cuenta nueva.

La puntuación automática comprueba selecciones y posiciones. Las explicaciones requieren revisión humana. La ficha imprimible se habilita con las siete selecciones correctas. Cuatro actividades enviadas significa recorrido completo, aunque alguna respuesta necesite repaso.

## Comprobación final al publicar

Abre la URL HTTPS y comprueba registro, ingreso, recuperación desde otro navegador, consulta docente, comentario de ficha y exportación CSV. Esas pruebas en tu cuenta Netlify y el pilotaje con usuarios siguen pendientes. No hay alumnos ni calificaciones de ejemplo precargados.

La cobertura de las 17 pruebas y la revisión visual están en `docs/VERIFICACION.md`. La base escolar y las fuentes están en `docs/CONTENIDO_Y_DISENO.md`; el contexto recuperado y su actualización, en `docs/CONTEXTO_Y_CONTINUIDAD.md`.
