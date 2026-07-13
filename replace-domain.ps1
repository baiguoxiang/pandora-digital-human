# 域名替换脚本 - 部署前运行
# 使用方法: .\replace-domain.ps1 new-domain.com

param(
    [Parameter(Mandatory=$true)]
    [string]$NewDomain
)

$basePath = Split-Path -Parent $MyInvocation.MyCommand.Path
$chineseDomain = "潘多拉.com"

Write-Host "正在将 '$chineseDomain' 替换为 '$NewDomain' ..." -ForegroundColor Cyan

# 获取所有需要处理的文件
$files = Get-ChildItem $basePath -Include "*.html","*.js","*.css","*.md" -Recurse

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match [regex]::Escape($chineseDomain)) {
        $content = $content -replace [regex]::Escape($chineseDomain), $NewDomain
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "  ✓ $($file.FullName.Replace($basePath, ''))" -ForegroundColor Green
        $count++
    }
}

Write-Host "`n完成！共替换 $count 个文件" -ForegroundColor Yellow
Write-Host "请将此文件夹部署到你的 Web 服务器" -ForegroundColor Cyan
