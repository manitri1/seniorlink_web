<#
.SYNOPSIS
  로컬 Supabase DB를 재생성한 뒤 마이그레이션을 단계별로 적용합니다.

.DESCRIPTION
  - 기본: `supabase db reset --yes` 한 번(전체 마이그레이션 + seed.sql).
  - -Stepwise: `migrations/` 안의 `YYYYMMDDHHMMSS_*.sql`을 이름순으로 읽어,
    각 단계마다 `supabase db reset --version <타임스탬프> --yes`를 실행합니다.
    매 단계마다 DB가 통째로 다시 만들어지므로, 스키마가 단계적으로 쌓이는지 검증할 때만 사용하세요(시간이 오래 걸림).
  - -Pause: 단계 사이에 Enter 입력 대기.

  원격(`--linked`) 데이터 삭제는 이 스크립트에서 다루지 않습니다.

.EXAMPLE
  .\supabase\scripts\stepwise-db-reset.ps1
  .\supabase\scripts\stepwise-db-reset.ps1 -Stepwise -Pause
#>
param(
  [switch]$Stepwise,
  [switch]$Pause
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Error "npx 가 PATH 에 없습니다. Node.js 를 설치하세요."
  exit 1
}

if (-not $Stepwise) {
  Write-Host ">>> 전체 마이그레이션 + seed.sql (supabase db reset --yes)`n" -ForegroundColor Green
  npx supabase db reset --yes
  exit $LASTEXITCODE
}

$migrationsDir = Join-Path $repoRoot "supabase\migrations"
$migrations = Get-ChildItem -Path $migrationsDir -Filter "*.sql" |
  Where-Object { $_.Name -match '^\d{14}_' } |
  Sort-Object Name

if ($migrations.Count -eq 0) {
  Write-Error "마이그레이션 SQL 이 없습니다: $migrationsDir"
  exit 1
}

$idx = 0
foreach ($m in $migrations) {
  $idx++
  if ($m.Name -notmatch '^(\d{14})_') { continue }
  $ver = $Matches[1]
  Write-Host "`n>>> [$idx/$($migrations.Count)] Through version $ver`n    $($m.Name)`n" -ForegroundColor Cyan
  npx supabase db reset --version $ver --yes
  if ($LASTEXITCODE -ne 0) {
    Write-Error "db reset --version $ver 실패 (exit $LASTEXITCODE)"
    exit $LASTEXITCODE
  }
  if ($Pause -and $idx -lt $migrations.Count) {
    Read-Host "다음 마이그레이션까지 Enter"
  }
}

Write-Host "`n>>> 단계별 적용 완료 (마지막 버전까지 반영됨).`n" -ForegroundColor Green
exit 0
