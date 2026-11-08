@echo off
setlocal
cd /d "%~dp0"
set "NODE_EXE="
where node >nul 2>nul && set "NODE_EXE=node"
if not defined NODE_EXE if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
if not defined NODE_EXE if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined NODE_EXE if exist "C:\Users\ALEF\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "NODE_EXE=C:\Users\ALEF\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined NODE_EXE (
  echo Nao encontrei o Node.js neste computador.
  echo Instale o Node.js LTS e execute este arquivo novamente.
  pause
  exit /b 1
)
start "Servidor local de Hinos" /D "%~dp0" "%NODE_EXE%" servidor.js
set "READY="
for /l %%N in (1,1,10) do if not defined READY (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "try { iwr -UseBasicParsing http://127.0.0.1:8787/api/info -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }"
  if not errorlevel 1 set "READY=yes"
  if not defined READY timeout /t 1 /nobreak >nul
)
if not defined READY (
  echo O servidor nao respondeu em localhost:8787.
  echo Abra a janela 'Servidor local de Hinos' para ver o erro.
  pause
  exit /b 1
)
start "Mesa de Hinos" http://127.0.0.1:8787/
echo.
echo O servidor local foi iniciado e a mesa foi aberta.
echo Para o celular, use o endereco exibido na janela do servidor.
endlocal
