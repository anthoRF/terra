@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js 22.13 o superior desde https://nodejs.org y vuelve a abrir este archivo.
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
  echo Instalando dependencias. La primera vez necesitas conexion a Internet.
  call npm ci --no-audit --no-fund
  if errorlevel 1 (
    echo No se pudieron instalar las dependencias. Revisa tu conexion y vuelve a intentar.
    pause
    exit /b 1
  )
)
echo.
echo Terra se abrira en el navegador. Mantén esta ventana abierta.
echo La clave docente de esta computadora esta en el archivo .env de esta carpeta.
echo Los datos locales no son los datos de Netlify.
echo.
call npm run dev -- --open
pause
