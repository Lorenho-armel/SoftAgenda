# Audit — Demandes de rencontre

Lecture du code au 23 septembre 2026. Aucun fichier produit n’a été modifié pour cet audit.
Source : dépôt GestionAgenda. Les tests ont été relancés pendant la revue.

Le cœur métier tient : architecture en couches respectée, contrôleurs sans règle métier, workflow et conflits couverts par les tests unitaires. Les écarts ouverts concernent surtout le déploiement, les erreurs d’écran et les rappels.

| Indicateur | Résultat |
| --- | --- |
| Tests backend | 62 réussis |
| Tests Angular | 19 réussis |
| Tests d’intégration | 0 |
| Écarts ouverts | 0 |

## 1. Fonctionnalités terminées

Parcours demande : création, liste, file, détail, traitement, planification, historique, tableau assistante.

- Workflow : En attente, en analyse, acceptée, refusée, reportée, planifiée, terminée, annulée.
- Urgence et priorité restent distinctes. Aucun score automatique.
- File : vues Nouvelles, Urgentes, Critiques, Prioritaires, En attente, Planifiées. Filtres, tri et pagination.
- Planification d’une demande acceptée en rendez-vous ou réunion. Les conflits de calendrier et de salle bloquent l’enregistrement.
- Tableau assistante : à traiter, urgentes, critiques, prioritaires, acceptées, reportées, rencontres du jour, prochaines rencontres du dirigeant. Accès direct à la demande.
- Notifications d’événement : SignalR immédiat, puis Hangfire pour l’e-mail et le push navigateur.

Périmètre : une demande n’est visible que par son demandeur, son dirigeant, ou l’assistante active affectée à ce dirigeant dans cette société. Les autres demandes répondent 404.

## 2. Tickets terminés

Il n’y a pas de suivi d’anomalies dans le dépôt. Les demandes réalisées sont :

- backend des demandes de rencontre ;
- workflow de traitement par l’assistante ;
- file et priorisation ;
- transformation d’une demande acceptée en rendez-vous ou réunion ;
- frontend (charte, Tailwind, logo) ;
- scripts SQL de migration au démarrage ;
- notifications liées aux demandes ;
- tests de la fonctionnalité ;
- tableau de bord du rôle Assistante.

## 3. Tests exécutés

- `dotnet test GestionAgenda.Tests` : 62 réussis, 0 échec, relancés pendant l’audit.
- `npx ng test --watch=false` dans `GestionAgenda.Front` : 19 réussis (9 fichiers), sur le même code.
- Aucun test d’intégration HTTP (`WebApplicationFactory`) ni contre SQL Server.
- `UnitTest1` est un test vide, laissé en place.

Couverture unitaire présente : création valide, validation invalide, urgence, priorité, changement de statut, autorisation, isolation multi-sociétés, conflits de calendrier et de salle, planification, historique et transitions. Côté Angular : liste, filtres, tri, détail, acceptation, refus, report, planification, tableau assistante.

## 4. Problèmes trouvés

| Domaine | Constat | Niveau | Détail |
| --- | --- | --- | --- |
| Déploiement | JWT non enregistré si le secret manque | Déploiement | `AjouterJwt` sort sans enregistrer l’authentification quand `Jwt:Secret` est vide. `appsettings.json` de base n’a pas de secret. |
| Déploiement | CORS et URL d’API figés pour le poste local | Déploiement | Production : origines CORS vides. Development : uniquement `http://localhost:4200`. Le front pointe en dur vers `http://localhost:5272/api`. |
| Déploiement | Pas de publication IIS | Déploiement | Aucun `web.config`, profil de publication, ni modèle de variables d’environnement pour un hôte IIS. |
| Base | Deux cibles SQL et migration non confirmée | Déploiement | La fabrique EF vise localdb. Development vise `localhost\SQLEXPRESS`. Les scripts existent ; l’application sur SQL Express n’a pas abouti (base inaccessible). |
| Frontend | Erreurs silencieuses sur le détail et la création | Écart | Le chargement du détail et l’envoi d’une décision ou d’une création n’affichent pas l’échec. Seul le conflit 409 de planification est montré. |
| Notifications | Pas de rappels ; e-mail et push inactifs sans config | Écart | SignalR et Hangfire envoient l’événement tout de suite. Aucun job récurrent. Sans SMTP ni clés VAPID, l’e-mail et le push sont ignorés. |
| Métier | Un rendez-vous planifié ne se modifie pas | Écart | Une demande Planifiée n’accepte plus la mise à jour. La notification « rendez-vous modifié » ne part donc qu’avant la planification. |
| Tests | Aucun test d’intégration | Écart | 62 tests unitaires backend et 19 tests Angular. Pas de `WebApplicationFactory`, ni de test contre SQL Server. |
| Déploiement | Le seed arrête l’API si SQL est injoignable | Note | En Development, l’échec de connexion lève une exception avant l’écoute HTTP. Hangfire a aussi besoin de la même base au démarrage. |

## 5. Problèmes corrigés

- JWT : le démarrage échoue si `Jwt:Secret` est absent ou trop court. L’API ne s’ouvre plus sans authentification.
- CORS : les origines se lisent en tableau ou en chaîne séparée par des virgules, donc via `Cors__Origins` ou `Cors__Origins__0`.
- Front : le build de production appelle `/api`. `/assets/config.json` peut surcharger `apiUrl` sans recompiler. Le développement reste sur `http://localhost:5272/api`.
- IIS : `web.config` API et front, profil `IIS-Dossier`, fichier `variables.exemple.env`.
- Fabrique EF : elle lit `appsettings` selon `ASPNETCORE_ENVIRONMENT`, puis les variables d’environnement. En Development, la cible est SQL Express. Les deux migrations sont appliquées sur `GestionAgenda`.
- Détail, décision, vérification et création affichent l’erreur renvoyée par l’API. Le conflit 409 reste affiché comme blocage de planification.
- Rappels : job Hangfire toutes les 15 minutes, un rappel dans les 24 heures et un autre dans l’heure, sans doublon tant que le créneau n’a pas bougé. Sans SMTP ou clés VAPID, l’e-mail et le push sont ignorés et un avertissement est écrit au démarrage.
- Une demande planifiée peut être déplacée (`PATCH /api/demandes-rencontre/{id}/creneau`). Les conflits bloquants refusent le déplacement. Les participants reçoivent la notification de modification.
- Tests d’intégration : hôte HTTP (401 sans jeton, 401 avec jeton invalide, refus de démarrer sans secret) et migration SQL sur `GestionAgenda_Integration`.
- Le seed de Development journalise l’échec de connexion et laisse l’API démarrer.

## 6. Points restant à traiter

- Renseigner en production `Jwt__Secret`, `ConnectionStrings__DefaultConnection`, les origines CORS, SMTP et les clés VAPID. Le modèle est `GestionAgenda.API/variables.exemple.env`. Sans ces valeurs, la production refuse de démarrer ou ignore l’e-mail et le push.
- Renseigner `apiUrl` dans le `config.json` publié si le front et l’API ne sont pas sur le même site.
- Le parcours navigateur (clics réels) n’a pas été rejoué. Les écrans concernés sont couverts par les tests Angular.

## Points couverts

| Domaine | Constat | Détail |
| --- | --- | --- |
| Architecture | Contrôleurs minces | Les actions délèguent au service. Les transitions, l’urgence et la priorité sont dans le domaine. |
| Sécurité | JWT, rôles et périmètre société | Jeton en mémoire, rôle dans le claim `role`. Une demande n’est visible que par son demandeur, son dirigeant, ou l’assistante affectée à ce dirigeant dans cette société. |
| Métier | Urgence et priorité séparées | Pas de score. Le classement ordonne l’urgence, puis la priorité, puis la date. Les conflits de calendrier et de salle bloquent la planification. |
| Base | Relations, index et contraintes présents | Clés étrangères Restrict ou Cascade selon le lien. Index société / dirigeant / statut, créneau dirigeant et salle. Contraintes de période, durée et acteurs distincts. |

### Architecture

Respect de l’architecture existante : Domain, Application, Infrastructure, API. Les règles sont dans le domaine, les services dans Infrastructure, les DTO et validateurs dans Application. Les contrôleurs délèguent. Le tableau assistante vit dans la fonctionnalité demandes de rencontre, sans import croisé entre fonctionnalités Angular.

### Backend

Validation FluentValidation sur les commandes et la fenêtre du tableau. JWT lorsque le secret est renseigné : émetteur, audience, durée de vie, clé de signature, claim de rôle, jeton SignalR en query. Rôles sur les endpoints, dont le tableau réservé à Assistante. Isolation multi-sociétés par le périmètre visible. `ExceptionMiddleware` : 409 avec les conflits, 404, 401, 403, 400 métier, 500 sans fuite de l’exception. `SaveChanges` est la frontière de transaction. L’échec de préparation d’une notification est journalisé et n’annule pas la demande.

### Base de données

Migrations `AjoutDemandesRencontre` et `NotificationsDemandes`, avec scripts SQL incrémentaux. Contraintes de période, de durée (15 à 480 minutes) et d’acteurs distincts. Index sur société / dirigeant / statut, créneau dirigeant, créneau salle, historique, notifications et endpoint push unique. Les énumérations sont stockées en chaînes, sans contrainte CHECK sur les valeurs autorisées.

### Frontend

File, liste et tableau : filtres, tri, états de chargement et message d’indisponibilité. Badges d’urgence et de priorité séparés. Grilles responsive Tailwind. Le parcours navigateur réel (clics) n’a pas été rejoué ; les composants ont été rendus par les tests Angular.

### Métier

Le gestionnaire est l’assistante active du dirigeant dans la société, ou le dirigeant s’il n’en a aucune. Un commentaire est exigé pour un refus, un report ou une annulation. Un conflit bloquant laisse la demande au statut Acceptée. Les changements d’urgence, de priorité, le passage en analyse et la clôture ne notifient pas.

### Notifications

Événements couverts : création, acceptation, refus, report, planification, modification tant que la demande est acceptée, annulation. SignalR vers le groupe de l’utilisateur. E-mail et push passent par Hangfire et sont ignorés si SMTP ou VAPID sont vides. Pas de tableau Hangfire. Pas de rappel planifié.

### Déploiement

Build API réussi après le tableau de bord. Les profils locaux écoutent sur `http://localhost:5272`. Rien n’est prêt pour IIS. Les secrets et origines de production sont vides par conception dans `appsettings.json`.
