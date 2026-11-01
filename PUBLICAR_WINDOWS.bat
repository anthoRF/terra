@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js 22.13 o superior y revisa LEEME.html.
  pause
  exit /b 1
)
node -e "const v=process.versions.node.split('.').map(Number);process.exit(v[0] < 22 || v[0] === 22 && v[1] < 13 ? 1 : 0)"
if errorlevel 1 (
  echo Terra necesita Node.js 22.13 o superior.
  pause
  exit /b 1
)
if not exist "node_modules\.package-lock.json" (
  call npm ci --no-audit --no-fund
  if errorlevel 1 exit /b 1
)
echo.
echo Inicia sesion en TU cuenta de Netlify en el navegador que abra el comando.
call npx netlify login
if errorlevel 1 exit /b 1
if not exist ".netlify\state.json" (
  echo.
  echo Se creara un proyecto vacio y se vinculara a esta carpeta.
  echo Elige tu equipo gratuito y un nombre para el proyecto.
  call npx netlify sites:create
  if errorlevel 1 exit /b 1
)
echo.
echo Antes de publicar, abre el proyecto en Netlify y configura DOCENTE_CLAVE.
echo Consulta LEEME.html para ver la ubicacion exacta y el alcance Functions.
echo No compartas esa clave ni la escribas en el codigo de la pagina.
echo.
pause
call npm run deploy
if errorlevel 1 (
  echo No se completo la publicacion. Revisa el mensaje anterior y LEEME.html.
) else (
  echo Publicacion terminada. Abre la URL indicada y realiza las comprobaciones de LEEME.html.
)
pause
