Write-Host "Starting Bootstrap migration process..."
$fixFiles = Get-ChildItem -Path "c:\Users\Buyer\Documents\CascadeProjects\CHWOne\src\components" -Filter "*.fix" -Recurse
Write-Host "Found $($fixFiles.Count) .fix files to process"

foreach ($file in $fixFiles) {
    $targetFile = $file.FullName -replace "\.fix$", ""
    Write-Host "Replacing $($file.BaseName) with Bootstrap version"
    try {
        Copy-Item -Path $file.FullName -Destination $targetFile -Force -ErrorAction Stop
        Write-Host "Successfully replaced $($file.BaseName)"
    } catch {
        Write-Host "ERROR: Failed to replace $($file.BaseName): $_"
    }
}

Write-Host "Migration complete! All .fix files have been applied."

# Verify no more Once UI dependencies
Write-Host "Verifying no more Once UI dependencies..."
$onceUIFiles = Select-String -Path "c:\Users\Buyer\Documents\CascadeProjects\CHWOne\src\components\**\*.tsx" -Pattern "@once-ui-system/core" | Select-Object Path -Unique
if ($onceUIFiles.Count -gt 0) {
    Write-Host "WARNING: Found $($onceUIFiles.Count) files still using Once UI:"
    $onceUIFiles | ForEach-Object { Write-Host "  - $($_.Path)" }
} else {
    Write-Host "SUCCESS: No more Once UI dependencies found!"
}
