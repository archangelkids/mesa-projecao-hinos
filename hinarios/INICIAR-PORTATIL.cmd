@echo off
setlocal
cd /d "%~dp0"
set "NODE_EXE=%~dp0runtime\node.exe"
if not exist "%NODE_EXE%" (
  echo Runtime portatil nao encontrado. Extraia o ZIP inteiro antes de abrir.
  pause
  exit /b 1
)
del /q servidor.port 2>nul
start "Servidor local de Hinos" cmd /k ""%NODE_EXE%" servidor.js"
set "PORT="
for /l %%T in (1,1,15) do if not exist servidor.port timeout /t 1 /nobreak >nul
if exist servidor.port set /p PORT=<servidor.port
if not defined PORT (
  echo O servidor nao informou uma porta.
  echo Verifique a janela 'Servidor local de Hinos' para ver o erro.
  pause
  exit /b 1
)
start "Mesa de Hinos" http://127.0.0.1:%PORT%/
echo Mesa iniciada.
echo.
echo Use no celular o endereco abaixo, conectado ao mesmo Wi-Fi:
findstr /c:"Celular:" servidor.log
echo.
echo O codigo de pareamento tambem aparece acima.
endlocal
