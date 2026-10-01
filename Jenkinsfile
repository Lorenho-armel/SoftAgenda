// Pipeline GestionAgenda : intégration continue sur toutes les branches,
// déploiement sur 151.80.218.41 uniquement depuis master.
//
// Variables globales Jenkins (Administrer Jenkins > System > Propriétés globales) :
//   MODE_DEPLOIEMENT = local  -> Jenkins tourne sur 151.80.218.41
//   MODE_DEPLOIEMENT = ssh    -> Jenkins tourne sur un autre poste et déploie par SSH
//   (absente ou autre valeur  -> aucun déploiement, CI seulement)
//   SERVEUR_151      = 151.80.218.41          (mode ssh)
//   URL_PUBLIQUE     = http://151.80.218.41   (vérification finale)
//
// Identifiants Jenkins :
//   ga-test-sql  (Secret text) chaîne de connexion de la base de TEST d'intégration
//   srv151-ssh   (SSH Username with private key) compte de déploiement sur 151 (mode ssh)

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 45, unit: 'MINUTES')
    }

    environment {
        DOTNET_CLI_TELEMETRY_OPTOUT = '1'
        DOTNET_NOLOGO = '1'
        ZIP = "livraison-${env.BUILD_NUMBER}.zip"
    }

    stages {
        stage('API : compilation') {
            steps {
                bat 'dotnet restore GestionAgenda.slnx'
                bat 'dotnet build GestionAgenda.slnx -c Release --no-restore'
            }
        }

        stage('API : tests') {
            steps {
                withCredentials([string(credentialsId: 'ga-test-sql', variable: 'GESTIONAGENDA_TEST_SQL')]) {
                    bat 'dotnet test GestionAgenda.Tests -c Release --no-build --logger trx --results-directory TestResults'
                }
            }
            post {
                always { archiveArtifacts artifacts: 'TestResults/*.trx', allowEmptyArchive: true }
            }
        }

        stage('Front : dépendances et tests') {
            steps {
                dir('GestionAgenda.Front') {
                    bat 'npm ci'
                    bat 'npx ng test --watch=false'
                }
            }
        }

        stage('Paquet de livraison') {
            steps {
                powershell '''
                    $ErrorActionPreference = 'Stop'
                    & .\\deploiement\\construire-livraison.ps1 -Sortie "$env:WORKSPACE\\$env:ZIP" -SansNpmCi
                '''
                archiveArtifacts artifacts: "${env.ZIP}", fingerprint: true
            }
        }

        stage('Déploiement sur 151.80.218.41') {
            when {
                allOf {
                    branch 'master'
                    expression { env.MODE_DEPLOIEMENT == 'local' || env.MODE_DEPLOIEMENT == 'ssh' }
                }
            }
            steps {
                script {
                    if (env.MODE_DEPLOIEMENT == 'local') {
                        powershell '''
                            $ErrorActionPreference = 'Stop'
                            Copy-Item "$env:WORKSPACE\\$env:ZIP" C:\\GestionAgenda\\livraisons\\ -Force
                            & .\\deploiement\\deployer.ps1 -Archive "C:\\GestionAgenda\\livraisons\\$env:ZIP"
                        '''
                    } else {
                        withCredentials([sshUserPrivateKey(credentialsId: 'srv151-ssh',
                                keyFileVariable: 'CLE_SSH', usernameVariable: 'UTILISATEUR_SSH')]) {
                            powershell '''
                                icacls $env:CLE_SSH /inheritance:r /grant:r "$($env:USERNAME):R" | Out-Null
                                $cible = "$($env:UTILISATEUR_SSH)@$($env:SERVEUR_151)"
                                $options = @('-i', $env:CLE_SSH, '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=accept-new')
                                scp @options $env:ZIP deploiement\\deployer.ps1 "$($cible):C:/GestionAgenda/livraisons/"
                                if ($LASTEXITCODE) { throw "Copie vers le serveur impossible (code $LASTEXITCODE)." }
                                ssh @options $cible "powershell -NoProfile -ExecutionPolicy Bypass -File C:\\GestionAgenda\\livraisons\\deployer.ps1 -Archive C:\\GestionAgenda\\livraisons\\$env:ZIP"
                                if ($LASTEXITCODE) { throw "Déploiement distant en échec (code $LASTEXITCODE)." }
                            '''
                        }
                    }
                }
                powershell '''
                    $ErrorActionPreference = 'Stop'
                    $url = if ($env:URL_PUBLIQUE) { $env:URL_PUBLIQUE } else { 'http://151.80.218.41' }
                    $reponse = Invoke-WebRequest "$url/" -UseBasicParsing -TimeoutSec 20
                    if ($reponse.StatusCode -ne 200) { throw "Le front ne répond pas ($($reponse.StatusCode))." }
                    Write-Host "Front accessible : $url"
                '''
            }
        }
    }

    post {
        always { cleanWs(deleteDirs: true, notFailBuild: true, patterns: [[pattern: 'livraison-*.zip', type: 'INCLUDE']]) }
    }
}
