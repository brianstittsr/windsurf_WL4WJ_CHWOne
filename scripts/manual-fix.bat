@echo off
echo Starting manual fix for Next.js build issues...

echo Stopping any running Next.js servers...
taskkill /f /im node.exe 2>nul

echo Deleting .next directory...
if exist .next (
  rd /s /q .next
  echo .next directory deleted
) else (
  echo .next directory does not exist
)

echo Deleting node_modules\.cache directory...
if exist node_modules\.cache (
  rd /s /q node_modules\.cache
  echo node_modules\.cache directory deleted
) else (
  echo node_modules\.cache directory does not exist
)

echo Running Next.js build...
call npm run build

echo.
echo Manual fix completed!
echo You can now run 'npm run dev' to start the development server
