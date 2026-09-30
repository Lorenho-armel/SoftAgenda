<#
.SYNOPSIS
    Simulation de bout en bout : Collaborateur -> demande -> Assistante -> acceptation -> validation -> vérification dans le Sheet.

.DESCRIPTION
    Utilise uniquement les vrais endpoints de l'API en cours d'exécution. La synchronisation vers Google Sheets
    est celle de l'application (jobs Hangfire) ; le Sheet est relu via GET /api/google-sheets/lignes/{id}.
    Les données créées sont marquées "[SIMULATION-SYNC <horodatage>]" dans le motif.

.EXAMPLE
    .\outils\simulation\Simulation-SynchroSheet.ps1
    .\outils\simulation\Simulation-SynchroSheet.ps1 -Nettoyer
#>
[CmdletBinding()]
param(
    [string]$BaseUrl = 'http://localhost:5272',
    [string]$EmailCollaborateur = 'collaborateur@demo.local',
    [string]$EmailAssistante = 'assistante@demo.local',
    [string]$MotDePasse = 'Azerty!2026',
    [string]$Societe = 'Holding Démo',
    [string]$Dirigeant = 'Claire Martin',
    [int]$DelaiSheetSecondes = 90,
    [switch]$Nettoyer,
    [switch]$AutoriserHorsLocal
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0
[Console]::OutputEncoding = [Text.Encoding]::UTF8

$horodatage = Get-Date -Format 'yyyyMMdd-HHmmss'
$tag = "[SIMULATION-SYNC $horodatage]"
$dossierResultats = Join-Path $PSScriptRoot 'resultats'
New-Item -ItemType Directory -Force -Path $dossierResultats | Out-Null
$fichierLog = Join-Path $dossierResultats "simulation-$horodatage.log"
$fichierRapport = Join-Path $dossierResultats "rapport-$horodatage.md"
$script:controles = New-Object System.Collections.Generic.List[object]
$script:numeroEtape = 0

function Journal([string]$niveau, [string]$message) {
    $ligne = '{0} [{1,-5}] {2}' -f (Get-Date -Format 'HH:mm:ss.fff'), $niveau, $message
    Add-Content -Path $fichierLog -Value $ligne -Encoding UTF8
    $couleur = @{ 'INFO' = 'Gray'; 'ETAPE' = 'Cyan'; 'OK' = 'Green'; 'ECHEC' = 'Red'; 'ALERT' = 'Yellow' }[$niveau]
    Write-Host $ligne -ForegroundColor $couleur
}

function Etape([string]$titre) {
    $script:numeroEtape++
    Journal 'ETAPE' ("=== Étape {0} : {1}" -f $script:numeroEtape, $titre)
}

function Controle([string]$vue, [string]$champ, $attendu, $obtenu) {
    $ok = "$attendu" -eq "$obtenu"
    $script:controles.Add([pscustomobject]@{ Etape = $script:numeroEtape; Vue = $vue; Champ = $champ; Attendu = "$attendu"; Obtenu = "$obtenu"; Resultat = $(if ($ok) { 'OK' } else { 'ECHEC' }) })
    if ($ok) { Journal 'OK' "$vue / $champ = « $obtenu »" }
    else { Journal 'ECHEC' "$vue / $champ : attendu « $attendu », obtenu « $obtenu »" }
    return $ok
}

function NonVerifiable([string]$vue, [string]$champ, [string]$raison) {
    $script:controles.Add([pscustomobject]@{ Etape = $script:numeroEtape; Vue = $vue; Champ = $champ; Attendu = '-'; Obtenu = $raison; Resultat = 'NON VÉRIFIABLE' })
    Journal 'ALERT' "$vue / $champ non vérifiable : $raison"
}

function Api([string]$methode, [string]$chemin, $corps = $null, [string]$jeton = $null) {
    $entetes = @{}
    if ($jeton) { $entetes['Authorization'] = "Bearer $jeton" }
    $parametres = @{ Method = $methode; Uri = "$BaseUrl$chemin"; Headers = $entetes; UseBasicParsing = $true }
    if ($null -ne $corps) {
        $json = $corps | ConvertTo-Json -Depth 10 -Compress
        $parametres['Body'] = [Text.Encoding]::UTF8.GetBytes($json)
        $parametres['ContentType'] = 'application/json; charset=utf-8'
    }
    Journal 'INFO' "-> $methode $chemin"
    try {
        $reponse = Invoke-WebRequest @parametres
        $texte = [Text.Encoding]::UTF8.GetString($reponse.RawContentStream.ToArray())
        $donnees = if ($texte) { ($texte | ConvertFrom-Json) } else { $null }
        Journal 'INFO' "<- $($reponse.StatusCode)"
        return [pscustomobject]@{ Ok = $true; Statut = [int]$reponse.StatusCode; Data = $(if ($donnees -and ($donnees.PSObject.Properties.Name -contains 'data')) { $donnees.data } else { $donnees }); Message = $null }
    }
    catch {
        $statut = 0
        if ($_.Exception.Response) { $statut = [int]$_.Exception.Response.StatusCode }
        $message = if ($_.ErrorDetails) { $_.ErrorDetails.Message } else { $null }
        if (-not $message -and $_.Exception.Response -and ($_.Exception.Response | Get-Member -Name GetResponseStream)) {
            try { $message = (New-Object IO.StreamReader($_.Exception.Response.GetResponseStream(), [Text.Encoding]::UTF8)).ReadToEnd() } catch { }
        }
        if ($message) { try { $message = ($message | ConvertFrom-Json).message } catch { } }
        if (-not $message) { $message = $_.Exception.Message }
        Journal 'ALERT' "<- $statut : $message"
        return [pscustomobject]@{ Ok = $false; Statut = $statut; Data = $null; Message = $message }
    }
}

function Exiger($reponse, [string]$action) {
    if (-not $reponse.Ok) {
        Journal 'ECHEC' "$action impossible ($($reponse.Statut)) : $($reponse.Message)"
        Ecrire-Rapport 'ÉCHEC'
        exit 1
    }
    return $reponse.Data
}

function Connexion([string]$email) {
    $donnees = Exiger (Api 'POST' '/api/auth/login' @{ email = $email; motDePasse = $MotDePasse }) "Connexion de $email"
    $charge = $donnees.accessToken.Split('.')[1].Replace('-', '+').Replace('_', '/')
    $charge += '=' * ((4 - $charge.Length % 4) % 4)
    $claims = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($charge)) | ConvertFrom-Json
    Journal 'OK' "Connecté : $email (id $($claims.sub), rôle(s) $(@($claims.role) -join ', '))"
    return [pscustomobject]@{ Jeton = $donnees.accessToken; Id = [string]$claims.sub; Email = $email; Roles = @($claims.role) }
}

function EnDate([object]$valeur) {
    if ($null -eq $valeur) { return $null }
    if ($valeur -is [datetime]) { return [DateTimeOffset]$valeur }
    return [DateTimeOffset]::Parse([string]$valeur, [Globalization.CultureInfo]::InvariantCulture)
}

function Local([object]$valeur) {
    $d = EnDate $valeur
    if ($null -eq $d) { return '' }
    return $d.ToLocalTime().ToString('yyyy-MM-dd HH:mm')
}

function Nom([string]$id) {
    if ($script:noms.ContainsKey($id)) { return $script:noms[$id] }
    return $id
}

function Photo-Application($demande, [string]$source) {
    $dernier = @($demande.historique | Sort-Object { EnDate $_.dateCreation }) | Select-Object -Last 1
    [pscustomobject]@{
        Source           = $source
        Statut           = [string]$demande.statut
        Demandeur        = [string]$demande.demandeurNom
        Periode          = "$(Local $demande.dateDebutSouhaitee) -> $(Local $demande.dateFinSouhaitee)"
        RendezVous       = $(if ($demande.rendezVousId) { [string]$demande.rendezVousId } else { '-' })
        DerniereAction   = $(if ($dernier) { "$($dernier.typeEvenement) par $(Nom ([string]$dernier.auteurId)) le $(Local $dernier.dateCreation)" } else { '-' })
        DateModification = Local $demande.dateModification
    }
}

function Lire-Sheet([string]$id, [string]$statutAttendu, $utilisateur) {
    $limite = (Get-Date).AddSeconds($DelaiSheetSecondes)
    $derniere = $null
    do {
        $reponse = Api 'GET' "/api/google-sheets/lignes/$id" $null $utilisateur.Jeton
        if (-not $reponse.Ok) {
            if ($reponse.Statut -in 401, 403, 404) { return [pscustomobject]@{ Erreur = $reponse.Message; Lignes = @() } }
            $derniere = [pscustomobject]@{ Erreur = $reponse.Message; Lignes = @() }
        }
        else {
            $lignes = @($reponse.Data.lignes)
            $derniere = [pscustomobject]@{ Erreur = $null; Lignes = $lignes }
            if ($lignes.Count -gt 0 -and $lignes[0].statut -eq $statutAttendu) {
                Journal 'OK' "Sheet : statut « $statutAttendu » lu ligne $($lignes[0].numero) après propagation automatique"
                return $derniere
            }
            Journal 'INFO' "Sheet : $($lignes.Count) ligne(s), statut actuel « $(if ($lignes.Count) { $lignes[0].statut } else { '-' }) » ; nouvelle lecture dans 3 s"
        }
        Start-Sleep -Seconds 3
    } while ((Get-Date) -lt $limite)
    return $derniere
}

function Verifier-Sheet([string]$moment, $lecture, [hashtable]$attendu) {
    if ($lecture.Erreur) {
        NonVerifiable "Sheet ($moment)" 'Ligne' $lecture.Erreur
        return $null
    }
    Controle "Sheet ($moment)" 'Nombre de lignes pour cet ID (pas de doublon)' 1 $lecture.Lignes.Count | Out-Null
    if ($lecture.Lignes.Count -eq 0) { return $null }
    $ligne = $lecture.Lignes[0]
    foreach ($champ in $attendu.Keys) {
        Controle "Sheet ($moment)" $champ $attendu[$champ] $ligne.$champ | Out-Null
    }
    return $ligne
}

function Ecrire-Rapport([string]$verdict) {
    $l = New-Object System.Collections.Generic.List[string]
    $l.Add("# Simulation de synchronisation : $tag")
    $l.Add('')
    $l.Add("- Verdict : **$verdict**")
    $l.Add("- API : $BaseUrl ; exécution du $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
    if ($script:demandeId) { $l.Add("- Demande de test : ``$script:demandeId``") }
    $l.Add("- Journal détaillé : ``$(Split-Path $fichierLog -Leaf)`` (côté API, filtrer les lignes ``[Sync Sheet]``)")
    $l.Add('')
    if ($script:photos.Count -gt 0) {
        $l.Add('## Avant / après dans l''application')
        $l.Add('')
        $l.Add('| Moment | Statut | Demandeur | Période souhaitée | Rendez-vous | Dernière action | Dernière modification |')
        $l.Add('|---|---|---|---|---|---|---|')
        foreach ($p in $script:photos) { $l.Add("| $($p.Source) | $($p.Statut) | $($p.Demandeur) | $($p.Periode) | $($p.RendezVous) | $($p.DerniereAction) | $($p.DateModification) |") }
        $l.Add('')
    }
    if ($script:sheet.Count -gt 0) {
        $l.Add('## Avant / après dans le Sheet')
        $l.Add('')
        $l.Add('| Moment | Ligne | Date | Début | Fin | Type | Objet | Société | Dirigeant | Demandeur | Priorité | Statut |')
        $l.Add('|---|---|---|---|---|---|---|---|---|---|---|---|')
        foreach ($s in $script:sheet) {
            if ($s.Ligne) { $x = $s.Ligne; $l.Add("| $($s.Moment) | $($x.numero) | $($x.date) | $($x.heureDebut) | $($x.heureFin) | $($x.type) | $($x.objet) | $($x.societe) | $($x.dirigeant) | $($x.demandeur) | $($x.priorite) | **$($x.statut)** |") }
            else { $l.Add("| $($s.Moment) | - | | | | | | | | | | $($s.Erreur) |") }
        }
        $l.Add('')
    }
    $l.Add('## Contrôles')
    $l.Add('')
    $l.Add('| Étape | Vue | Champ | Attendu | Obtenu | Résultat |')
    $l.Add('|---|---|---|---|---|---|')
    foreach ($c in $script:controles) { $l.Add("| $($c.Etape) | $($c.Vue) | $($c.Champ) | $($c.Attendu) | $($c.Obtenu) | $($c.Resultat) |") }
    [IO.File]::WriteAllLines($fichierRapport, $l, (New-Object Text.UTF8Encoding $true))
    Journal 'INFO' "Rapport écrit : $fichierRapport"
}

$script:demandeId = $null
$script:photos = New-Object System.Collections.Generic.List[object]
$script:sheet = New-Object System.Collections.Generic.List[object]
$script:noms = @{}

# --- Garde-fou : jamais contre un serveur distant par accident ---
$hote = ([Uri]$BaseUrl).Host
if (-not $AutoriserHorsLocal -and $hote -notin 'localhost', '127.0.0.1', '::1') {
    Journal 'ECHEC' "API « $hote » non locale : relancer avec -AutoriserHorsLocal si c'est voulu (environnement de test uniquement)."
    exit 1
}
Journal 'INFO' "Simulation $tag contre $BaseUrl"

# ---------------------------------------------------------------- Collaborateur
Etape 'Collaborateur : connexion'
$collaborateur = Connexion $EmailCollaborateur

Etape 'Collaborateur : préparation de la demande (référentiel réel)'
$societes = @(Exiger (Api 'GET' '/api/referentiel/societes' $null $collaborateur.Jeton) 'Lecture des sociétés')
$societeChoisie = $societes | Where-Object { $_.nom -eq $Societe } | Select-Object -First 1
if (-not $societeChoisie) { Journal 'ECHEC' "Société « $Societe » introuvable pour $EmailCollaborateur."; exit 1 }
$detailSociete = Exiger (Api 'GET' "/api/referentiel/societes/$($societeChoisie.id)" $null $collaborateur.Jeton) 'Lecture de la société'
foreach ($p in @($detailSociete.dirigeants) + @($detailSociete.membres)) { $script:noms[[string]$p.id] = [string]$p.nomComplet }
$dirigeantChoisi = @($detailSociete.dirigeants) | Where-Object { $_.nomComplet -eq $Dirigeant } | Select-Object -First 1
if (-not $dirigeantChoisi) { Journal 'ECHEC' "Dirigeant « $Dirigeant » introuvable dans « $Societe »."; exit 1 }
$nomCollaborateur = Nom $collaborateur.Id

$jour = (Get-Date).Date.AddDays(14 + (Get-Random -Minimum 0 -Maximum 30))
while ($jour.DayOfWeek -in 'Saturday', 'Sunday') { $jour = $jour.AddDays(1) }
$heure = @(9, 10, 11, 14, 15, 16) | Get-Random
$debutSouhaite = [DateTimeOffset]$jour.AddHours($heure)
$finSouhaitee = $debutSouhaite.AddHours(2)
$motif = "$tag Point de validation de la synchronisation Google Sheets"
Journal 'INFO' "Créneau souhaité : $($debutSouhaite.ToString('dd/MM/yyyy HH:mm')) - $($finSouhaitee.ToString('HH:mm')), dirigeant $Dirigeant"

Etape 'Collaborateur : création et soumission de la demande'
$creee = Exiger (Api 'POST' '/api/demandes-rencontre' @{
        dirigeantId = $dirigeantChoisi.id; societeId = $societeChoisie.id; type = 'RendezVous'; motif = $motif
        dateDebutSouhaitee = $debutSouhaite.ToString('o'); dateFinSouhaitee = $finSouhaitee.ToString('o'); dureeMinutes = 60
        urgence = 'Normal'; priorite = 'Moyenne'; salleSouhaiteeId = $null; participants = @()
    } $collaborateur.Jeton) 'Création de la demande'
$script:demandeId = [string]$creee.id
Journal 'OK' "Demande créée : $script:demandeId"

Etape 'Collaborateur : vérification de l''enregistrement'
$vueCollaborateur = Exiger (Api 'GET' "/api/demandes-rencontre/$script:demandeId" $null $collaborateur.Jeton) 'Lecture de la demande'
Controle 'Détail (collaborateur)' 'Statut' 'EnAttente' $vueCollaborateur.statut | Out-Null
Controle 'Détail (collaborateur)' 'Demandeur' $nomCollaborateur $vueCollaborateur.demandeurNom | Out-Null
Controle 'Détail (collaborateur)' 'Motif' $motif $vueCollaborateur.motif | Out-Null
Controle 'Détail (collaborateur)' 'Début souhaité' $debutSouhaite.ToString('yyyy-MM-dd HH:mm') (Local $vueCollaborateur.dateDebutSouhaitee) | Out-Null
$script:photos.Add((Photo-Application $vueCollaborateur 'Avant : après création (collaborateur)'))

# ---------------------------------------------------------------- Assistante
Etape 'Déconnexion du collaborateur, connexion de l''assistante'
$collaborateur.Jeton = $null
$assistante = Connexion $EmailAssistante
$nomAssistante = Nom $assistante.Id

Etape 'Sheet : la demande créée par le collaborateur y apparaît automatiquement'
$attenduCreation = @{
    date = $debutSouhaite.ToString('yyyy-MM-dd'); heureDebut = $debutSouhaite.ToString('HH:mm'); heureFin = $finSouhaitee.ToString('HH:mm')
    type = 'Rendez-vous'; objet = $motif; societe = $Societe; dirigeant = $Dirigeant; demandeur = $nomCollaborateur; priorite = 'Moyenne'; statut = 'À confirmer'
}
$lecture = Lire-Sheet $script:demandeId 'À confirmer' $assistante
$script:sheet.Add([pscustomobject]@{ Moment = 'Avant : après création'; Ligne = (Verifier-Sheet 'création' $lecture $attenduCreation); Erreur = $lecture.Erreur })

Etape 'Assistante : consultation des demandes reçues'
$liste = Exiger (Api 'GET' "/api/demandes-rencontre?Search=$([Uri]::EscapeDataString($tag))&Size=50" $null $assistante.Jeton) 'Liste des demandes'
$trouvee = @($liste.items) | Where-Object { $_.id -eq $script:demandeId }
Controle 'Liste (assistante)' 'Demande retrouvée' 'oui' $(if ($trouvee) { 'oui' } else { 'non' }) | Out-Null

Etape 'Assistante : acceptation'
$avantAcceptation = EnDate $vueCollaborateur.dateModification
Start-Sleep -Milliseconds 1100
$acceptee = Exiger (Api 'PATCH' "/api/demandes-rencontre/$script:demandeId/statut" @{ statut = 'Acceptee'; commentaire = "$tag Acceptée par l'assistante" } $assistante.Jeton) 'Acceptation'
$detail = Exiger (Api 'GET' "/api/demandes-rencontre/$script:demandeId" $null $assistante.Jeton) 'Relecture'
$evenement = @($detail.historique) | Where-Object { $_.typeEvenement -eq 'Acceptation' } | Select-Object -Last 1
Controle 'Détail (assistante)' 'Statut' 'Acceptee' $detail.statut | Out-Null
Controle 'Détail (assistante)' 'Historique : acceptation par' $nomAssistante $(if ($evenement) { Nom ([string]$evenement.auteurId) } else { '-' }) | Out-Null
Controle 'Détail (assistante)' 'Date de modification mise à jour' 'oui' $(if ((EnDate $detail.dateModification) -gt $avantAcceptation) { 'oui' } else { 'non' }) | Out-Null
$script:photos.Add((Photo-Application $detail 'Après acceptation (assistante)'))

$attenduAcceptation = $attenduCreation.Clone(); $attenduAcceptation['statut'] = 'Accepté'
$lecture = Lire-Sheet $script:demandeId 'Accepté' $assistante
$script:sheet.Add([pscustomobject]@{ Moment = 'Après acceptation'; Ligne = (Verifier-Sheet 'acceptation' $lecture $attenduAcceptation); Erreur = $lecture.Erreur })

Etape 'Assistante : validation (planification du rendez-vous)'
$debutPlanifie = $debutSouhaite
$finPlanifiee = $debutPlanifie.AddMinutes(60)
$avantValidation = EnDate $detail.dateModification
Start-Sleep -Milliseconds 1100
$validee = Api 'PATCH' "/api/demandes-rencontre/$script:demandeId/statut" @{ statut = 'Planifiee'; commentaire = "$tag Validée par l'assistante"; debutPlanifie = $debutPlanifie.ToString('o') } $assistante.Jeton
if (-not $validee.Ok -and $validee.Statut -eq 409) {
    Journal 'ALERT' 'Conflit de calendrier sur ce créneau : relancer la simulation (un autre créneau sera tiré).'
}
Exiger $validee 'Validation' | Out-Null
$detail = Exiger (Api 'GET' "/api/demandes-rencontre/$script:demandeId" $null $assistante.Jeton) 'Relecture'
$evenement = @($detail.historique) | Where-Object { $_.typeEvenement -eq 'Planification' } | Select-Object -Last 1
Controle 'Détail (assistante)' 'Statut' 'Planifiee' $detail.statut | Out-Null
Controle 'Détail (assistante)' 'Rendez-vous créé' 'oui' $(if ($detail.rendezVousId) { 'oui' } else { 'non' }) | Out-Null
Controle 'Détail (assistante)' 'Historique : validation par' $nomAssistante $(if ($evenement) { Nom ([string]$evenement.auteurId) } else { '-' }) | Out-Null
Controle 'Détail (assistante)' 'Historique : commentaire de validation' "$tag Validée par l'assistante" $(if ($evenement) { $evenement.commentaire } else { '-' }) | Out-Null
Controle 'Détail (assistante)' 'Date de modification mise à jour' 'oui' $(if ((EnDate $detail.dateModification) -gt $avantValidation) { 'oui' } else { 'non' }) | Out-Null
Controle 'Détail (assistante)' 'Demandeur inchangé' $nomCollaborateur $detail.demandeurNom | Out-Null

Etape 'Propagation vers les autres vues de l''application'
$liste = Exiger (Api 'GET' "/api/demandes-rencontre?Search=$([Uri]::EscapeDataString($tag))&Size=50" $null $assistante.Jeton) 'Liste des demandes'
Controle 'Liste (assistante)' 'Statut' 'Planifiee' ((@($liste.items) | Where-Object { $_.id -eq $script:demandeId }).statut) | Out-Null
$aujourdhui = [DateTimeOffset](Get-Date).Date
$bornes = "debutJour=$([Uri]::EscapeDataString($aujourdhui.ToString('o')))&finJour=$([Uri]::EscapeDataString($aujourdhui.AddDays(1).ToString('o')))"
$tableau = Exiger (Api 'GET' "/api/dashboard/assistante?$bornes" $null $assistante.Jeton) 'Tableau de bord'
Controle 'Tableau de bord (assistante)' 'Rencontre présente dans les prochaines rencontres' 'oui' $(if (($tableau | ConvertTo-Json -Depth 10) -match [regex]::Escape($script:demandeId)) { 'oui' } else { 'non' }) | Out-Null
$collaborateur = Connexion $EmailCollaborateur
$vueCollaborateur = Exiger (Api 'GET' "/api/demandes-rencontre/$script:demandeId" $null $collaborateur.Jeton) 'Relecture côté collaborateur'
Controle 'Détail (collaborateur)' 'Statut vu par le demandeur' 'Planifiee' $vueCollaborateur.statut | Out-Null
$script:photos.Add((Photo-Application $vueCollaborateur 'Après : après validation (vu par le collaborateur)'))

Etape 'Sheet : acceptation et validation répercutées automatiquement'
$attenduValidation = $attenduCreation.Clone()
$attenduValidation['heureDebut'] = $debutPlanifie.ToString('HH:mm')
$attenduValidation['heureFin'] = $finPlanifiee.ToString('HH:mm')
$attenduValidation['statut'] = 'Confirmé'
$lecture = Lire-Sheet $script:demandeId 'Confirmé' $assistante
$script:sheet.Add([pscustomobject]@{ Moment = 'Après : après validation'; Ligne = (Verifier-Sheet 'validation' $lecture $attenduValidation); Erreur = $lecture.Erreur })

if ($Nettoyer) {
    Etape 'Nettoyage : annulation de la demande de test'
    Exiger (Api 'PATCH' "/api/demandes-rencontre/$script:demandeId/statut" @{ statut = 'Annulee'; commentaire = "$tag Fin de simulation" } $assistante.Jeton) 'Annulation' | Out-Null
    $attenduAnnulation = $attenduValidation.Clone(); $attenduAnnulation['statut'] = 'Annulé'
    $lecture = Lire-Sheet $script:demandeId 'Annulé' $assistante
    $script:sheet.Add([pscustomobject]@{ Moment = 'Nettoyage : annulation'; Ligne = (Verifier-Sheet 'annulation' $lecture $attenduAnnulation); Erreur = $lecture.Erreur })
}

# ---------------------------------------------------------------- Bilan
$echecs = @($script:controles | Where-Object { $_.Resultat -eq 'ECHEC' }).Count
$nonVerifiables = @($script:controles | Where-Object { $_.Resultat -eq 'NON VÉRIFIABLE' }).Count
$verdict = if ($echecs -gt 0) { 'ÉCHEC' } elseif ($nonVerifiables -gt 0) { 'PARTIEL : application validée, Sheet non vérifiable' } else { 'RÉUSSI : synchronisation démontrée de bout en bout' }
Etape "Bilan : $verdict"
Journal 'INFO' ("{0} contrôles, {1} échec(s), {2} non vérifiable(s)" -f $script:controles.Count, $echecs, $nonVerifiables)
$script:photos | Format-Table -AutoSize | Out-String -Width 250 | Write-Host
Ecrire-Rapport $verdict
if ($echecs -gt 0) { exit 1 }
