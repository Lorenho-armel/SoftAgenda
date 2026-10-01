-- Création des premiers comptes en production (le jeu de démonstration n'est jamais chargé hors développement).
-- À exécuter UNE SEULE FOIS, après les migrations :
--   sqlcmd -S localhost\SQLEXPRESS -E -b -I -d GestionAgenda -i comptes-initiaux.sql
-- Remplacer toutes les valeurs entre < >.
-- Hachage d'un mot de passe (sur un poste avec le SDK .NET 10) :
--   dotnet run deploiement/hash-mot-de-passe.cs -- "MotDePasse"
-- Rôles possibles : Dirigeant, Assistante, Collaborateur.

SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @Maintenant datetimeoffset = SYSDATETIMEOFFSET();
DECLARE @SocieteId uniqueidentifier = NEWID();
DECLARE @DirigeantId uniqueidentifier = NEWID();
DECLARE @AssistanteId uniqueidentifier = NEWID();
DECLARE @CollaborateurId uniqueidentifier = NEWID();

INSERT INTO [Societes] ([Id], [Nom], [DateCreation], [DateModification])
VALUES (@SocieteId, N'<Nom de la société>', @Maintenant, @Maintenant);

INSERT INTO [Utilisateurs] ([Id], [Nom], [Prenom], [Email], [MotDePasseHash], [DateCreation], [DateModification])
VALUES
    (@DirigeantId, N'<Nom>', N'<Prénom>', LOWER(N'<email.dirigeant@societe.com>'), N'<hash du mot de passe>', @Maintenant, @Maintenant),
    (@AssistanteId, N'<Nom>', N'<Prénom>', LOWER(N'<email.assistante@societe.com>'), N'<hash du mot de passe>', @Maintenant, @Maintenant),
    (@CollaborateurId, N'<Nom>', N'<Prénom>', LOWER(N'<email.collaborateur@societe.com>'), N'<hash du mot de passe>', @Maintenant, @Maintenant);

INSERT INTO [UtilisateurSocietes] ([Id], [UtilisateurId], [SocieteId], [Role], [DateCreation], [DateModification])
VALUES
    (NEWID(), @DirigeantId, @SocieteId, N'Dirigeant', @Maintenant, @Maintenant),
    (NEWID(), @AssistanteId, @SocieteId, N'Assistante', @Maintenant, @Maintenant),
    (NEWID(), @CollaborateurId, @SocieteId, N'Collaborateur', @Maintenant, @Maintenant);

INSERT INTO [AffectationAssistantes] ([Id], [AssistanteId], [DirigeantId], [SocieteId], [EstActive], [DateCreation], [DateModification])
VALUES (NEWID(), @AssistanteId, @DirigeantId, @SocieteId, 1, @Maintenant, @Maintenant);

INSERT INTO [Salles] ([Id], [SocieteId], [Nom], [Capacite], [EstActive], [DateCreation], [DateModification])
VALUES (NEWID(), @SocieteId, N'<Salle de réunion>', 8, 1, @Maintenant, @Maintenant);

COMMIT TRANSACTION;
