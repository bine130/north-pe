@echo off
chcp 65001 > nul
echo PostgreSQL Portable Initialization Starting...
echo.

set PGPATH=%cd%\postgresql-16.9-3-windows-x64-binaries\pgsql
set PGDATA=%PGPATH%\data
set PATH=%PGPATH%\bin;%PATH%

echo [1/4] Initializing data directory...
if not exist "%PGDATA%" (
    "%PGPATH%\bin\initdb.exe" -D "%PGDATA%" -E UTF8 --locale=C --username=postgres
    echo Database initialization complete!
) else (
    echo Data directory already exists.
)

echo.
echo [2/4] Modifying PostgreSQL configuration...
echo host    all             all             127.0.0.1/32            trust >> "%PGDATA%\pg_hba.conf"
echo host    all             all             ::1/128                 trust >> "%PGDATA%\pg_hba.conf"

echo.
echo [3/4] Starting PostgreSQL server...
start /B "%PGPATH%\bin\pg_ctl.exe" -D "%PGDATA%" -l "%PGDATA%\logfile" start

timeout /t 5

echo.
echo [4/4] Creating north_pe_db database...
"%PGPATH%\bin\psql.exe" -U postgres -c "CREATE DATABASE north_pe_db WITH ENCODING='UTF8';"

echo.
echo PostgreSQL initialization complete!
echo Database: north_pe_db
echo User: postgres
echo Password: (none - trust authentication)
echo.
pause