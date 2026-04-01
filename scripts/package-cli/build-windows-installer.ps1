param(
  [Parameter(Mandatory = $true)][string]$BundleDir,
  [Parameter(Mandatory = $true)][string]$Version,
  [Parameter(Mandatory = $true)][string]$OutputDir
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$env:EXE_BUNDLE_DIR = (Resolve-Path $BundleDir).Path
$env:EXE_VERSION = $Version
$env:EXE_OUTPUT_DIR = (Resolve-Path $OutputDir).Path

$issPath = Join-Path $PSScriptRoot 'windows-installer.iss'
$iscc = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"
if (!(Test-Path $iscc)) {
  $iscc = "${env:ProgramFiles}\Inno Setup 6\ISCC.exe"
}

& $iscc $issPath
