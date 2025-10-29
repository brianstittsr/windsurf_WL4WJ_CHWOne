$files = @(
    "src\app\admin\schema\page.tsx",
    "src\app\ai-assistant\page.tsx",
    "src\app\chws\page.tsx",
    "src\app\civicrm\page.tsx",
    "src\app\dashboard\page.tsx",
    "src\app\dashboard\region-5\page.tsx",
    "src\app\dashboard\wl4wj\page.tsx",
    "src\app\datasets\merge\page.tsx",
    "src\app\datasets\page.tsx",
    "src\app\forms\builder\page.tsx",
    "src\app\forms\page.tsx",
    "src\app\grants\page.tsx",
    "src\app\login\page.tsx",
    "src\app\magic-home\page.tsx",
    "src\app\page.tsx",
    "src\app\profile\[userId]\page.tsx",
    "src\app\profile\page.tsx",
    "src\app\projects\page.tsx",
    "src\app\referrals\page.tsx",
    "src\app\register\page.tsx",
    "src\app\reports\page.tsx",
    "src\app\resources\page.tsx",
    "src\app\settings\page.tsx",
    "src\app\surveys\page.tsx",
    "src\app\training\checkout\[courseId]\page.tsx",
    "src\app\training\courses\[courseId]\page.tsx",
    "src\app\training\page.tsx",
    "src\app\upload\page.tsx",
    "src\app\workforce\page.tsx"
)

foreach ($file in $files) {
    $fullPath = Join-Path -Path $PWD -ChildPath $file
    
    if (Test-Path $fullPath) {
        Write-Host "Processing $file..."
        
        # Read the file content
        $content = Get-Content -Path $fullPath -Raw
        
        # Check if the file already has AuthProvider import
        if ($content -match "import\s+{\s*useAuth\s*}\s+from\s+['`"]@/contexts/AuthContext['`"]") {
            # Replace the import statement to include AuthProvider
            $content = $content -replace "import\s+{\s*useAuth\s*}\s+from\s+['`"]@/contexts/AuthContext['`"]", "import { useAuth, AuthProvider } from '@/contexts/AuthContext'"
            
            # Extract the component name
            if ($content -match "export\s+default\s+function\s+(\w+)") {
                $componentName = $matches[1]
                $contentComponentName = "${componentName}Content"
                
                # Replace the component structure
                $pattern = "export\s+default\s+function\s+$componentName\(\)\s*{(.*?)return\s+(.*?)}"
                $replacement = "function ${contentComponentName}() {`$1return `$2}`n`n// Export the wrapped component with AuthProvider`nexport default function $componentName() {`n  return (`n    <AuthProvider>`n      <$contentComponentName />`n    </AuthProvider>`n  );`n}"
                
                $content = $content -replace $pattern, $replacement -replace "(?s)"
                
                # Save the modified content
                Set-Content -Path $fullPath -Value $content
                Write-Host "Fixed $file"
            } else {
                Write-Host "Could not find component name in $file"
            }
        } else {
            Write-Host "$file does not use useAuth or is already fixed"
        }
    } else {
        Write-Host "$file does not exist"
    }
}

Write-Host "All files processed!"
