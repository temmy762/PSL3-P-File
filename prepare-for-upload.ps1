# PSL3 Productions - Website Deployment Script
# This script helps prepare the website files for upload to Hostinger

# Check if required PowerShell modules are available
$requiredModules = @("Microsoft.PowerShell.Archive")
foreach ($module in $requiredModules) {
    if (-not (Get-Module -ListAvailable -Name $module)) {
        Write-Host "Required module $module is not available. Installing..."
        Install-Module -Name $module -Force -Scope CurrentUser
    }
}

# Variables
$sourceDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputZip = "c:\Users\user\Desktop\PSL3Productions-Website-$timestamp.zip"
$logFile = "c:\Users\user\Desktop\deployment-log-$timestamp.txt"

# Start logging
"PSL3 Productions Website Deployment - $(Get-Date)" | Out-File -FilePath $logFile
"Source directory: $sourceDir" | Out-File -FilePath $logFile -Append

# Function to check image optimization
function Test-OptimizedImages {
    param (
        [string]$imagesDir
    )
    
    "Checking image sizes..." | Out-File -FilePath $logFile -Append
    
    $largeImageThreshold = 1MB
    $largeImages = @()
    
    $imageFiles = Get-ChildItem -Path $imagesDir -Recurse -Include *.jpg, *.jpeg, *.png, *.gif
    
    foreach ($image in $imageFiles) {
        if ($image.Length -gt $largeImageThreshold) {
            $sizeMB = [math]::Round($image.Length / 1MB, 2)
            $largeImages += [PSCustomObject]@{
                Path = $image.FullName.Replace($sourceDir, '')
                Size = "$sizeMB MB"
            }
        }
    }
    
    if ($largeImages.Count -gt 0) {
        "Found $($largeImages.Count) large images:" | Out-File -FilePath $logFile -Append
        $largeImages | Format-Table -AutoSize | Out-String | Out-File -FilePath $logFile -Append
        
        return $largeImages
    } else {
        "No unusually large images found." | Out-File -FilePath $logFile -Append
        return $null
    }
}

# Function to check broken links
function Test-BrokenLinks {
    param (
        [string]$directory
    )
    
    "Checking for potential broken links..." | Out-File -FilePath $logFile -Append
    
    $htmlFiles = Get-ChildItem -Path $directory -Recurse -Include *.html
    $brokenLinks = @()
    
    foreach ($file in $htmlFiles) {
        $content = Get-Content -Path $file.FullName -Raw
        
        # Check for common patterns that might indicate broken links
        if ($content -match 'href="#"') {
            $brokenLinks += [PSCustomObject]@{
                File = $file.FullName.Replace($sourceDir, '')
                Issue = "Contains href='#' placeholder links"
            }
        }
        
        # Check for links to non-existent files
        $relativeLinks = [regex]::Matches($content, 'href="([^"#]+?\.(html|php|css|js))"') | ForEach-Object { $_.Groups[1].Value }
        
        foreach ($link in $relativeLinks) {
            if ($link -notmatch '^(https?://|mailto:|tel:)') {
                $targetPath = Join-Path -Path $file.DirectoryName -ChildPath $link
                
                # Handle relative paths
                if ($link -match '^\.\.') {
                    $targetPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($file.DirectoryName, $link))
                }
                
                if (-not (Test-Path $targetPath)) {
                    $brokenLinks += [PSCustomObject]@{
                        File = $file.FullName.Replace($sourceDir, '')
                        Issue = "Broken link to: $link"
                    }
                }
            }
        }
    }
    
    if ($brokenLinks.Count -gt 0) {
        "Found $($brokenLinks.Count) potential link issues:" | Out-File -FilePath $logFile -Append
        $brokenLinks | Format-Table -AutoSize | Out-String | Out-File -FilePath $logFile -Append
        
        return $brokenLinks
    } else {
        "No potential broken links found." | Out-File -FilePath $logFile -Append
        return $null
    }
}

# Run pre-deployment checks
"Running pre-deployment checks..." | Out-File -FilePath $logFile -Append

# Check for large images
$largeImages = Test-OptimizedImages -imagesDir (Join-Path -Path $sourceDir -ChildPath "assets\images")

# Check for broken links
$brokenLinks = Test-BrokenLinks -directory $sourceDir

# Create deployment zip
"Creating deployment package..." | Out-File -FilePath $logFile -Append
try {
    Compress-Archive -Path "$sourceDir\*" -DestinationPath $outputZip -Force
    "Deployment package created successfully at: $outputZip" | Out-File -FilePath $logFile -Append
} catch {
    "ERROR: Failed to create deployment package: $_" | Out-File -FilePath $logFile -Append
}

# Display summary
"Deployment preparation completed at $(Get-Date)" | Out-File -FilePath $logFile -Append

# Output to console
Write-Host "`n==== PSL3 Productions Website Deployment Summary ====" -ForegroundColor Cyan
Write-Host "Deployment package created at: $outputZip" -ForegroundColor Green

if ($largeImages -ne $null) {
    Write-Host "`nWARNING: Found $($largeImages.Count) large images that could be optimized" -ForegroundColor Yellow
    Write-Host "Check the deployment log for details." -ForegroundColor Yellow
}

if ($brokenLinks -ne $null) {
    Write-Host "`nWARNING: Found $($brokenLinks.Count) potential link issues" -ForegroundColor Yellow
    Write-Host "Check the deployment log for details." -ForegroundColor Yellow
}

Write-Host "`nDeployment log saved to: $logFile" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Upload the ZIP file to Hostinger and extract it" -ForegroundColor White
Write-Host "2. Configure the PHP form handler on the server" -ForegroundColor White
Write-Host "3. Test all forms and links after deployment" -ForegroundColor White
Write-Host "4. Set up redirects from old URLs if needed" -ForegroundColor White

Write-Host "`nFor detailed instructions, refer to README.md" -ForegroundColor Cyan
