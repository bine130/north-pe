@echo off
chcp 65001 > nul

echo === North PE Quick Start ===
echo.

REM PostgreSQL 시작
set PGPATH=%cd%\postgresql-16.9-3-windows-x64-binaries\pgsql
set PGDATA=%PGPATH%\data

if not exist "%PGDATA%" (
    echo First time setup - initializing PostgreSQL...
    call init_postgres.bat
) else (
    echo Starting PostgreSQL...
    "%PGPATH%\bin\pg_ctl.exe" -D "%PGDATA%" -l "%PGDATA%\logfile" start
)

echo.
echo Starting servers...

REM 백엔드 시작
start cmd /k "title Backend Server && cd backend && pip install -r requirements.txt && uvicorn main:app --reload"

REM 잠시 대기
timeout /t 3 > nul

REM 프론트엔드 시작  
start cmd /k "title Frontend Server && cd frontend && npm start"

echo.
echo Servers are starting...
echo - Backend: http://localhost:8001
echo - Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul