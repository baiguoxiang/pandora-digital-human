Write-Host "To configure GitHub Pages, you need a Personal Access Token (PAT)."
Write-Host "Steps to get PAT:"
Write-Host "1. Go to https://github.com/settings/tokens"
Write-Host "2. Click 'Generate new token (classic)'"
Write-Host "3. Give it a name like 'Pandora Deployment'"
Write-Host "4. Select scopes: repo, workflow"
Write-Host "5. Click 'Generate token'"
Write-Host "6. Copy the token and paste it below"
Write-Host ""

\ = Read-Host "Enter your GitHub Personal Access Token"
Write-Host ""
Write-Host "Token received. Configuring GitHub Pages..."

# 配置 GitHub Pages
\ = @{
    "Authorization" = "token \"
    "Accept" = "application/vnd.github.v3+json"
}

\ = @{
    build_type = "workflow"
    source = @{
        branch = "main"
        path = "/"
    }
}

try {
    \ = Invoke-RestMethod -Uri "https://api.github.com/repos/baiguoxiang/pandora-ai-platform/pages" 
        -Method Patch 
        -Headers \ 
        -Body (\ | ConvertTo-Json) 
        -ContentType "application/json"
    
    Write-Host "GitHub Pages enabled successfully!"
    Write-Host "Your site will be available at: https://baiguoxiang.github.io/pandora-ai-platform"
} catch {
    Write-Host "Error: \"
}
