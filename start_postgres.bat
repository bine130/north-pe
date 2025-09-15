@echo off
chcp 65001 > nul
echo Starting PostgreSQL Portable server...
echo.

set PGPATH=%cd%\postgresql-16.9-3-windows-x64-binaries\pgsql
set PGDATA=%PGPATH%\data

if not exist "%PGDATA%" (
    echo Database not initialized!
    echo Please run init_postgres.bat first.
    pause
    exit /b 1
)

"%PGPATH%\bin\pg_ctl.exe" -D "%PGDATA%" -l "%PGDATA%\logfile" start

echo.
echo PostgreSQL server started.
echo.
echo Connection info:
echo - Host: localhost
echo - Port: 5432
echo - Database: north_pe_db
echo - User: postgres
echo - Password: (none)
echo.
pause