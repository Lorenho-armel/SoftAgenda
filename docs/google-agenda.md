# Synchronisation Google Agenda

Sens unique, **application → Google Agenda** :

- Une rencontre **planifiée** (rendez-vous ou réunion) est publiée dans l'agenda Google du dirigeant : titre `[RDV] Motif – Société` ou `[Réunion] …`, salle en lieu, demandeur, participants, priorité et lien vers la demande en description.
- Un **déplacement** met l'événement à jour ; une **annulation** le retire ; une rencontre **terminée** reste dans l'agenda.
- Les **indisponibilités** apparaissent en privé (« Indisponible – Déplacement… ») et disparaissent quand on les supprime.
- Les demandes non planifiées (en attente, en analyse, acceptées) ne sont pas publiées.
- Une modification faite directement dans Google Agenda **n'est pas reprise** par l'application et sera écrasée à la prochaine mise à jour de la rencontre.

Les participants ne reçoivent pas d'invitation Google : un compte de service ne peut pas inviter sans délégation Google Workspace. Ils sont prévenus par les notifications de l'application.

## 1. Activer l'API

Le compte de service de la synchronisation Google Sheets suffit (voir `google-sheets.md`, section 2).

1. Sur [console.cloud.google.com](https://console.cloud.google.com), ouvrir le même projet.
2. **API et services > Bibliothèque** : activer **Google Calendar API**.

## 2. Partager l'agenda de chaque dirigeant

Le dirigeant (ou quelqu'un qui gère son agenda) :

1. Ouvre [Google Agenda](https://calendar.google.com), survole son agenda dans « Mes agendas », **⋮ > Paramètres et partage**.
2. **Partager avec des personnes ou des groupes spécifiques > Ajouter des personnes** : saisit l'adresse du compte de service (`…@….iam.gserviceaccount.com`, affichée dans le panneau Google Agenda de l'application).
3. Choisit l'autorisation **Apporter des modifications aux événements**, puis **Envoyer**.

Par défaut, l'application publie dans l'**agenda principal** du dirigeant, dont l'identifiant est son adresse e-mail. Si l'e-mail Google du dirigeant diffère de celui de l'application, ou pour publier dans un agenda secondaire, renseigner la correspondance dans `Agendas` (l'identifiant d'un agenda secondaire se trouve dans **Paramètres et partage > Intégrer l'agenda**).

## 3. Configurer l'API

Dans `appsettings.Development.json` (non versionné) ou les variables d'environnement :

```json
"GoogleCalendar": {
  "Actif": true,
  "FichierCleCompteService": "C:\\secrets\\gestion-agenda-compte-service.json",
  "UrlApplication": "https://agenda.softwell.local",
  "Agendas": {
    "dirigeant@demo.local": "claire.martin@gmail.com"
  }
}
```

- `FichierCleCompteService` : la même clé JSON que pour Google Sheets.
- `UrlApplication` : adresse du front, pour le lien « Demande : … » dans la description (facultatif).
- `Agendas` : e-mail du dirigeant dans l'application → identifiant de l'agenda Google (facultatif).
- `CertificatRacineSupplementaire` : même rôle que pour Google Sheets (pare-feu avec inspection SSL, voir `google-sheets.md`).

Redémarrer l'API après modification.

## 4. Vérifier

1. Se connecter en assistante ou dirigeant, ouvrir **Agenda** : le panneau **Google Agenda** affiche l'adresse du compte de service.
2. **Vérifier l'accès** : chaque dirigeant géré doit afficher « Agenda accessible en écriture ». Sinon, le message indique quoi corriger (agenda non partagé, droit en lecture seule, API non activée).
3. Planifier une demande : l'événement apparaît dans Google Agenda en quelques secondes. Les logs de l'API tracent chaque étape (`[Sync Agenda] …`).
4. **Resynchroniser** publie en une fois toutes les rencontres et indisponibilités des 30 derniers jours et à venir (utile au premier branchement).

Un échec (Google injoignable, agenda non partagé) n'empêche jamais de planifier dans l'application : la tâche est relancée automatiquement par Hangfire, visible dans le tableau de bord Hangfire.
