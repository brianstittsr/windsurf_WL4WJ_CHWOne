# This script finds all pages using useAuth and wraps them with AuthProvider
# It creates a backup of each file before modifying it

# Find all page.tsx files in the src/app directory
$pageFiles = Get-ChildItem -Path "src\app" -Filter "page.tsx" -Recurse

foreach ($file in $pageFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if the file uses useAuth but doesn't have AuthProvider
    if ($content -match "useAuth" -and $content -notmatch "AuthProvider") {
        Write-Host "Fixing auth in: $($file.FullName)"
        
        # Create a backup
        Copy-Item -Path $file.FullName -Destination "$($file.FullName).bak"
        
        # Extract the component name
        if ($content -match "export\s+default\s+function\s+(\w+)") {
            $componentName = $matches[1]
            $contentComponentName = "${componentName}Content"
            
            # Fix the import statement
            $content = $content -replace "import\s+{\s*useAuth\s*}\s+from\s+['`"]@/contexts/AuthContext['`"]", "import { useAuth, AuthProvider } from '@/contexts/AuthContext'"
            
            # Replace the component structure
            $pattern = "export\s+default\s+function\s+$componentName\s*\([^)]*\)\s*{(.*?)return\s+(.*?)}"
            $replacement = "// Inner component that uses the auth context`nfunction ${contentComponentName}() {`$1return `$2}`n`n// Export the wrapped component with AuthProvider`nexport default function $componentName() {`n  return (`n    <AuthProvider>`n      <$contentComponentName />`n    </AuthProvider>`n  );`n}"
            
            $content = $content -replace $pattern, $replacement -replace "(?s)"
            
            # Save the modified content
            Set-Content -Path $file.FullName -Value $content
            Write-Host "Fixed $($file.Name)"
        } else {
            Write-Host "Could not find component name in $($file.Name)"
        }
    }
}

Write-Host "All files processed!"
