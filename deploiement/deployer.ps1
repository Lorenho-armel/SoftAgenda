<#
.SYNOPSIS
    Installe une livraison GestionAgenda sur le serveur IIS (151.80.218.41).
    À exécuter sur le serveur, dans une console PowerShell administrateur.

.DESCRIPTION
    1. Décompresse l'archive dans C:\GestionAgenda\livraisons\<nom>
    2. Sauvegarde la base puis applique le script SQL idempotent des migrations
    3. Arrête le pool de l'API, garde la version actuelle dans versions\precedente
    4. Copie l'API et le front (sans toucher appsettings.Production.json ni assets\config.json)
    5. Redémarre le pool et vérifie que l'API répond

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File C:\GestionAgenda\livraisons\deployer.ps1 -Archive C:\GestionAgenda\livraisons\livraison-12.zip
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $Archive,
    [string] $Racine = 'C:\GestionAgenda',
    [string] $InstanceSql = 'localhost\SQLEXPRESS',
    [string] $Base = 'GestionAgenda',
    [string] $PoolApi = 'GestionAgenda-API',
    [string] $UrlSante = 'http://localhost:8081/api/demandes-rencontre',
    [int] $LivraisonsConservees = 5,
    [int] $SauvegardesConservees = 10
)

$ErrorActionPreference = 'Stop'
Import-Module WebAdministration

function Etape([string] $message) { Write-Host "==> $message" }

function Copier([string] $source, [string] $cible, [string[]] $exclus = @()) {
    $ErrorActionPreference = 'Continue'
    $arguments = @($source, $cible, '/MIR', '/NFL', '/NDL', '/NP', '/R:5', '/W:2', '/XD', 'logs')
    if ($exclus.Count -gt 0) { $arguments += @('/XF') + $exclus }
    robocopy @arguments | Out-Host
    if ($LASTEXITCODE -ge 8) { throw "Copie $source -> $cible en échec (robocopy $LASTEXITCODE)." }
    $global:LASTEXITCODE = 0
}

function Sql([string[]] $arguments) {
    $ErrorActionPreference = 'Continue'
    sqlcmd -S $InstanceSql -E -b -I @arguments | Out-Host
    if ($LASTEXITCODE) { throw "sqlcmd en échec (code $LASTEXITCODE)." }
}

function CodeHttp([string] $url) {
    try { return [int](Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 10).StatusCode }
    catch {
        if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode }
        return 0
    }
}

$Archive = (Resolve-Path $Archive).Path
$nom = [IO.Path]::GetFileNameWithoutExtension($Archive)
$dossier = Join-Path $Racine "livraisons\$nom"
$configApi = Join-Path $Racine 'api\appsettings.Production.json'

if (-not (Test-Path $configApi)) {
    throw "$configApi est absent : créez-le avant le premier déploiement (voir le guide, configuration de production)."
}

Etape "Décompression de $Archive"
if (Test-Path $dossier) { Remove-Item $dossier -Recurse -Force }
Expand-Archive -Path $Archive -DestinationPath $dossier
foreach ($attendu in 'api\GestionAgenda.API.dll', 'front\index.html', 'migrations.sql') {
    if (-not (Test-Path (Join-Path $dossier $attendu))) { throw "Livraison incomplète : $attendu manquant." }
}
if (Test-Path "$dossier\version.txt") { Get-Content "$dossier\version.txt" | Out-Host }

Etape "Sauvegarde de la base $Base"
$sauvegarde = Join-Path $Racine "sauvegardes\$Base-$(Get-Date -Format 'yyyyMMdd-HHmmss').bak"
Sql @('-Q', "BACKUP DATABASE [$Base] TO DISK = N'$sauvegarde' WITH COPY_ONLY, INIT")

Etape 'Application des migrations'
try { Sql @('-d', $Base, '-i', (Join-Path $dossier 'migrations.sql')) }
catch { throw "Migrations en échec. La base a été sauvegardée avant : $sauvegarde. $_" }

Etape "Arrêt du pool $PoolApi"
if ((Get-WebAppPoolState $PoolApi).Value -ne 'Stopped') { Stop-WebAppPool $PoolApi }
$limite = (Get-Date).AddSeconds(60)
while ((Get-WebAppPoolState $PoolApi).Value -ne 'Stopped') {
    if ((Get-Date) -gt $limite) { throw "Le pool $PoolApi ne s'arrête pas." }
    Start-Sleep -Seconds 2
}

Etape 'Conservation de la version actuelle (retour arrière)'
Copier "$Racine\api" "$Racine\versions\precedente\api"
Copier "$Racine\front" "$Racine\versions\precedente\front"

Etape "Copie de l'API"
Copier "$dossier\api" "$Racine\api" @('appsettings.Production.json', 'appsettings.Development.json')

Etape 'Copie du front'
Copier "$dossier\front" "$Racine\front" @('config.json')

Etape "Démarrage du pool $PoolApi"
Start-WebAppPool $PoolApi

Etape "Contrôle de santé ($UrlSante doit répondre 401)"
$code = 0
for ($essai = 1; $essai -le 20 -and $code -ne 401; $essai++) {
    Start-Sleep -Seconds 3
    $code = CodeHttp $UrlSante
}
if ($code -ne 401) {
    throw "L'API ne répond pas correctement (dernier code HTTP : $code). Consulter l'Observateur d'événements (Application) et le guide, section Dépannage."
}

Etape 'Nettoyage des anciennes livraisons et sauvegardes'
Get-ChildItem "$Racine\livraisons" -Directory -Filter 'livraison-*' |
    Sort-Object LastWriteTime -Descending | Select-Object -Skip $LivraisonsConservees | Remove-Item -Recurse -Force
Get-ChildItem "$Racine\livraisons" -File -Filter 'livraison-*.zip' |
    Sort-Object LastWriteTime -Descending | Select-Object -Skip $LivraisonsConservees | Remove-Item -Force
Get-ChildItem "$Racine\sauvegardes" -File -Filter '*.bak' |
    Sort-Object LastWriteTime -Descending | Select-Object -Skip $SauvegardesConservees | Remove-Item -Force

Write-Host "Déploiement terminé : $nom"
