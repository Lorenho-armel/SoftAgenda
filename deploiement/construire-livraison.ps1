<#
.SYNOPSIS
    Construit le paquet de livraison GestionAgenda (API publiée, front Angular de production,
    script SQL idempotent des migrations, script d'installation).

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File deploiement\construire-livraison.ps1 -Sortie C:\Temp\livraison-manuelle.zip
#>
[CmdletBinding()]
param(
    [string] $Sortie = (Join-Path (Get-Location) 'livraison.zip'),
    [switch] $SansNpmCi
)

$ErrorActionPreference = 'Stop'
$racine = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$travail = Join-Path ([IO.Path]::GetTempPath()) "ga-livraison-$([guid]::NewGuid().ToString('N'))"
$Sortie = [IO.Path]::GetFullPath($Sortie)

function Executer([string] $libelle, [scriptblock] $commande) {
    Write-Host "==> $libelle"
    $ErrorActionPreference = 'Continue'
    & $commande
    if ($LASTEXITCODE) { throw "$libelle : échec (code $LASTEXITCODE)." }
}

$environnementAvant = $env:ASPNETCORE_ENVIRONMENT
$connexionAvant = $env:ConnectionStrings__DefaultConnection
Push-Location $racine
try {
    Executer "Publication de l'API" { dotnet publish GestionAgenda.API -c Release -o "$travail\api" }
    Remove-Item "$travail\api\appsettings.Development.json" -ErrorAction SilentlyContinue

    Executer 'Restauration des outils .NET' { dotnet tool restore }
    $env:ASPNETCORE_ENVIRONMENT = 'Production'
    $env:ConnectionStrings__DefaultConnection = 'Server=.;Database=GestionAgenda;Trusted_Connection=True;TrustServerCertificate=True'
    Executer 'Script SQL idempotent des migrations' {
        dotnet ef migrations script --idempotent --configuration Release `
            --project GestionAgenda.Infrastructure --startup-project GestionAgenda.API `
            --output "$travail\migrations.sql"
    }

    Push-Location GestionAgenda.Front
    try {
        if (-not $SansNpmCi) { Executer 'Installation des dépendances du front' { npm.cmd ci } }
        Executer 'Build Angular (production)' {
            npx.cmd ng build --configuration production --output-path "$travail\front-build"
        }
    }
    finally { Pop-Location }

    Move-Item "$travail\front-build\browser" "$travail\front"
    Remove-Item "$travail\front-build" -Recurse -Force
    Copy-Item (Join-Path $PSScriptRoot 'deployer.ps1') $travail
    Set-Content "$travail\version.txt" -Encoding UTF8 -Value @(
        "Commit : $(git rev-parse --short HEAD)"
        "Construit le : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    )

    Write-Host "==> Archive $Sortie"
    if (Test-Path $Sortie) { Remove-Item $Sortie -Force }
    Compress-Archive -Path "$travail\*" -DestinationPath $Sortie
    Write-Host "Livraison prête : $Sortie"
}
finally {
    Pop-Location
    $env:ASPNETCORE_ENVIRONMENT = $environnementAvant
    $env:ConnectionStrings__DefaultConnection = $connexionAvant
    if (Test-Path $travail) { Remove-Item $travail -Recurse -Force }
}
