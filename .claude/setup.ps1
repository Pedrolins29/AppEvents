# Claude Code environment setup for AppEvents project
# Run once to configure Haiku model as default for token optimization

Write-Host "Setting up Claude Code environment for AppEvents..." -ForegroundColor Cyan

# Set Haiku 4.5 as default model to optimize token usage
$modelVar = "ANTHROPIC_DEFAULT_HAIKU_MODEL"
$modelValue = "claude-haiku-4-5-20251001"

[System.Environment]::SetEnvironmentVariable($modelVar, $modelValue, "User")
Write-Host "✔ Set $modelVar=$modelValue (persistent user variable)" -ForegroundColor Green

# Set current session
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = $modelValue
Write-Host "✔ Applied to current session" -ForegroundColor Green

Write-Host ""
Write-Host "Setup complete! Start a new Claude Code session to apply changes." -ForegroundColor Cyan
Write-Host ""
Write-Host "Verify with: `$env:ANTHROPIC_DEFAULT_HAIKU_MODEL" -ForegroundColor Gray
