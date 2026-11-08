@echo off
cd /d "%~dp0"
start "Mesa de Hinos" /min node servidor.js
timeout /t 2 /nobreak >nul
start "" http://localhost:8787/
