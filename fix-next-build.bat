@echo off
echo ===================================================
echo CHWOne Next.js Build Fix Tool
echo ===================================================
echo.
echo This tool will fix the "Cannot find module './vendor-chunks/@opentelemetry.js'" error
echo by cleaning the Next.js build cache and rebuilding the application.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

echo.
echo Step 1: Stopping any running Next.js processes...
npx kill-port 3000 3001 3002 3003

echo.
echo Step 2: Cleaning Next.js build cache...
if exist ".next" (
  echo Removing .next directory...
  rmdir /s /q .next
  if exist ".next" (
    echo Failed to remove .next directory with rmdir, trying with rimraf...
    npx rimraf .next
  )
) else (
  echo .next directory does not exist, skipping...
)

echo.
echo Step 3: Running fix-opentelemetry script...
call npm run fix-opentelemetry

echo.
echo ===================================================
echo Fix completed! You can now run: npm run dev
echo ===================================================
echo.
pause
