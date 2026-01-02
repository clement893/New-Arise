# Script to remove trailing whitespace from files
# Usage: .\scripts\fix-trailing-whitespace.ps1

$files = @(
    "AUDIT_ASSESSMENTS_NEW_ARISE.md",
    "IMPLEMENTATION_COMPLETE_SUMMARY.md",
    "apps/web/src/app/[locale]/dashboard/assessments/**/*.tsx",
    "apps/web/src/data/mbtiQuestions.ts",
    "backend/app/api/v1/endpoints/assessments.py",
    "backend/app/models/assessment.py",
    "backend/app/services/feedback360_service.py",
    "backend/app/services/mbti_service.py",
    "backend/app/services/tki_service.py",
    "backend/app/services/wellness_service.py"
)

$count = 0

foreach ($pattern in $files) {
    $matchedFiles = Get-ChildItem -Path $pattern -Recurse -File -ErrorAction SilentlyContinue
    foreach ($file in $matchedFiles) {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        
        # Remove trailing whitespace from each line
        $lines = $content -split "`r?`n"
        $cleanedLines = $lines | ForEach-Object {
            $_ -replace '\s+$', ''
        }
        $newContent = $cleanedLines -join "`n"
        
        if ($newContent -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            Write-Host "Fixed: $($file.FullName)"
            $count++
        }
    }
}

Write-Host "`nFixed trailing whitespace in $count files"
