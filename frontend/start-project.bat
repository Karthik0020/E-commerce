@echo off
echo Starting E-Commerce Project...
echo.

echo 1. Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)
echo Node.js is installed.
echo.

echo 2. Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)
echo Dependencies installed successfully.
echo.

echo 3. Initializing database...
npm run init-db
if %errorlevel% neq 0 (
    echo ERROR: Failed to initialize database. Please check your PostgreSQL connection.
    pause
    exit /b 1
)
echo Database initialized successfully.
echo.

echo 4. Starting backend server...
start "Backend Server" cmd /k "npm start"
echo Backend server started on http://localhost:3000
echo.

echo 5. Starting frontend server...
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "npx http-server -p 5173"
echo Frontend server started on http://localhost:5173
echo.

echo ========================================
echo E-Commerce Project is now running!
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the frontend in your browser...
pause >nul
start http://localhost:5173
echo.
echo Project started successfully!
pause 