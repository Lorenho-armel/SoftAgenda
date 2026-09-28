# Synchronisation Google Sheets

Mode **hybride** :

- L'application écrit les colonnes métier (A à O) de l'onglet `Agenda` à chaque création, changement de statut ou replanification d'une demande, et à chaque ajout ou suppression d'indisponibilité.
- Les colonnes P à S (documents, brief, logistique, notes) et l'onglet `Suivi` appartiennent à l'assistante : l'application ne les modifie jamais.
- L'historique à venir déjà saisi dans le Sheet peut être importé une fois depuis l'Agenda (bouton **Importer les lignes à venir**).

## 1. Préparer le Sheet

1. Ouvrir `docs/Modele-Agenda-GestionAgenda.xlsx` dans Google Drive (**Fichier > Importer**, ou glisser le fichier puis **Ouvrir avec Google Sheets**, puis **Fichier > Enregistrer au format Google Sheets**).
2. Recopier l'agenda existant dans l'onglet `Agenda`, en laissant la colonne A (ID) vide. Les noms de société et de dirigeant doivent être ceux de l'application.
3. Relever l'identifiant du classeur dans l'URL : `https://docs.google.com/spreadsheets/d/<SpreadsheetId>/edit`.
4. Conseillé : **Données > Protéger des feuilles et des plages** sur `Agenda!A:O`, avec l'option « Afficher un avertissement lors de la modification ».

Le modèle se régénère avec `python docs/generer_modele_agenda.py` (nécessite `openpyxl`).

## 2. Créer le compte de service Google

1. Sur [console.cloud.google.com](https://console.cloud.google.com), créer un projet (ou en choisir un).
2. **API et services > Bibliothèque** : activer **Google Sheets API**.
3. **API et services > Identifiants > Créer des identifiants > Compte de service** : donner un nom, sans rôle particulier.
4. Ouvrir le compte de service, onglet **Clés > Ajouter une clé > JSON** : un fichier `.json` est téléchargé.
5. Dans le Sheet, **Partager** avec l'adresse du compte de service (`…@….iam.gserviceaccount.com`), en tant qu'**Éditeur**.

## 3. Configurer l'API

Placer la clé hors du dépôt (ou dans un dossier `secrets/`, ignoré par git), puis renseigner `appsettings.Development.json` (non versionné) ou les variables d'environnement :

```json
"GoogleSheets": {
  "Actif": true,
  "SpreadsheetId": "1AbC…",
  "Onglet": "Agenda",
  "FichierCleCompteService": "C:\\secrets\\gestion-agenda-compte-service.json",
  "FuseauHoraire": "Romance Standard Time"
}
```

- `FichierCleCompteService` : chemin absolu conseillé (un chemin relatif part du dossier de lancement de l'API).
- `FuseauHoraire` : fuseau des heures écrites dans le Sheet (identifiant Windows ou IANA). Vide = fuseau du serveur.
- La synchronisation passe par Hangfire : `Hangfire:Actif` doit être `true`.

Redémarrer l'API. Le panneau **Google Sheets** apparaît dans l'Agenda pour l'assistante et le dirigeant, avec les boutons **Ouvrir le Sheet**, **Resynchroniser** et **Importer les lignes à venir**.

## Règles de l'import

- Seules les lignes **sans ID**, **datées dans le futur** et dont le statut n'est pas Annulé, Refusé ou Terminé sont importées.
- Déplacement, Temps bloqué, Personnel et Événement deviennent des **indisponibilités** du dirigeant (elles bloquent la planification). Les autres types deviennent des **demandes**.
- Statut « Confirmé » : la demande est acceptée puis planifiée. En cas de conflit, elle reste acceptée et un avertissement est affiché.
- Participants séparés par `;` : `Nom <email>`, nom d'un membre de la société, ou email seul (externe).
- Demandeur inconnu : la personne qui importe devient le demandeur (avertissement).
- Aucune notification n'est envoyée pendant l'import. L'ID de chaque élément créé est inscrit en colonne A.
