@echo off
chcp 65001 > nul
echo Testing Backend API...
echo.

cd backend
echo Installing requirements...
pip install -r requirements.txt
echo.
echo Starting backend server...
uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause