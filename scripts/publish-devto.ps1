# Publishes docs/devto-submission.md to DEV through the official API (https://developers.forem.com/api).
# Your API key is typed in here and sent only to dev.to. It is never saved.
# Get a key: https://dev.to/settings/extensions  ->  "DEV Community API Keys"  ->  Generate API Key
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$md = Get-Content -Raw -Encoding UTF8 (Join-Path $root 'docs\devto-submission.md')

# Make sure the demo GIF is live on GitHub first (the post links to it there)
try {
  $gif = Invoke-WebRequest -Method Head -UseBasicParsing 'https://raw.githubusercontent.com/Quasie1/esp32-errata-lens/main/docs/demo/errata-lens-demo.gif'
  Write-Host "Demo GIF is on GitHub." -ForegroundColor Green
} catch {
  Write-Host "The demo GIF is not on GitHub yet. Run: git add -A; git commit -m 'Add demo'; git push   then run this again." -ForegroundColor Yellow
  exit 1
}

$secure = Read-Host 'Paste your DEV API key' -AsSecureString
$key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))

$choice = Read-Host 'Type P to publish now, or D to save as a draft'
$publish = $choice -match '^[Pp]'

$body = @{ article = @{ body_markdown = $md; published = $publish } } | ConvertTo-Json -Depth 5
$bytes = [Text.Encoding]::UTF8.GetBytes($body)
$res = Invoke-RestMethod -Method Post -Uri 'https://dev.to/api/articles' `
  -Headers @{ 'api-key' = $key; 'Accept' = 'application/vnd.forem.api-v1+json' } `
  -ContentType 'application/json; charset=utf-8' -Body $bytes
$key = $null

if ($publish) { Write-Host "Published: $($res.url)" -ForegroundColor Green }
else { Write-Host "Saved as draft (id $($res.id)). Find it at https://dev.to/dashboard" -ForegroundColor Green }
