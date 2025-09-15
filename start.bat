@echo off
chcp 65001 > nul
echo North PE System Starting...
echo.

echo [1/4] PostgreSQL Check...
if not exist "postgresql-16.9-3-windows-x64-binaries\pgsql\data" (
    echo Database initialization needed...
    call init_postgres.bat
) else (
    echo Starting PostgreSQL server...
    call start_postgres.bat
)

echo.
echo [2/4] Installing Python packages...
cd backend
pip install -r requirements.txt
cd ..

echo.
echo [3/4] Starting backend server...
start cmd /k "cd backend && python -m uvicorn main:app --reload"

timeout /t 5

echo [4/4] Starting frontend server...
start cmd /k "cd frontend && npm start"

echo.
echo System started!
echo - PostgreSQL: localhost:5432
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3000
echo.
pause