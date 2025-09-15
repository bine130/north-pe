@echo off
chcp 65001 > nul
echo Stopping PostgreSQL Portable server...
echo.

set PGPATH=%cd%\postgresql-16.9-3-windows-x64-binaries\pgsql
set PGDATA=%PGPATH%\data

"%PGPATH%\bin\pg_ctl.exe" -D "%PGDATA%" stop

echo.
echo PostgreSQL server stopped.
pause