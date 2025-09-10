@echo off
echo Building Quack Application...
echo.

echo Installing dependencies...
call npm install

echo Building frontend...
call npm run build

echo Building Tauri application...
call npm run tauri build

echo.
echo Build complete!
echo Executable location: src-tauri\target\release\rae.exe
echo Installer location: src-tauri\target\release\bundle\
pause
