IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Societes] (
    [Id] uniqueidentifier NOT NULL,
    [Nom] nvarchar(200) NOT NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_Societes] PRIMARY KEY ([Id])
);

CREATE TABLE [Utilisateurs] (
    [Id] uniqueidentifier NOT NULL,
    [Nom] nvarchar(100) NOT NULL,
    [Prenom] nvarchar(100) NOT NULL,
    [Email] nvarchar(256) NOT NULL,
    [MotDePasseHash] nvarchar(200) NOT NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_Utilisateurs] PRIMARY KEY ([Id])
);

CREATE TABLE [Salles] (
    [Id] uniqueidentifier NOT NULL,
    [SocieteId] uniqueidentifier NOT NULL,
    [Nom] nvarchar(200) NOT NULL,
    [Capacite] int NOT NULL,
    [EstActive] bit NOT NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_Salles] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Salles_Societes_SocieteId] FOREIGN KEY ([SocieteId]) REFERENCES [Societes] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [AffectationAssistantes] (
    [Id] uniqueidentifier NOT NULL,
    [AssistanteId] uniqueidentifier NOT NULL,
    [DirigeantId] uniqueidentifier NOT NULL,
    [SocieteId] uniqueidentifier NOT NULL,
    [EstActive] bit NOT NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_AffectationAssistantes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AffectationAssistantes_Societes_SocieteId] FOREIGN KEY ([SocieteId]) REFERENCES [Societes] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_AffectationAssistantes_Utilisateurs_AssistanteId] FOREIGN KEY ([AssistanteId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_AffectationAssistantes_Utilisateurs_DirigeantId] FOREIGN KEY ([DirigeantId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [RefreshTokens] (
    [Id] uniqueidentifier NOT NULL,
    [UtilisateurId] uniqueidentifier NOT NULL,
    [TokenHash] nvarchar(128) NOT NULL,
    [ExpireLe] datetimeoffset NOT NULL,
    [RevoqueLe] datetimeoffset NULL,
    [RemplaceParHash] nvarchar(128) NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_RefreshTokens_Utilisateurs_UtilisateurId] FOREIGN KEY ([UtilisateurId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [UtilisateurSocietes] (
    [Id] uniqueidentifier NOT NULL,
    [UtilisateurId] uniqueidentifier NOT NULL,
    [SocieteId] uniqueidentifier NOT NULL,
    [Role] nvarchar(20) NOT NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_UtilisateurSocietes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_UtilisateurSocietes_Societes_SocieteId] FOREIGN KEY ([SocieteId]) REFERENCES [Societes] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_UtilisateurSocietes_Utilisateurs_UtilisateurId] FOREIGN KEY ([UtilisateurId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [DemandeRencontres] (
    [Id] uniqueidentifier NOT NULL,
    [DemandeurId] uniqueidentifier NOT NULL,
    [DirigeantId] uniqueidentifier NOT NULL,
    [SocieteId] uniqueidentifier NOT NULL,
    [Type] nvarchar(20) NOT NULL,
    [Motif] nvarchar(500) NOT NULL,
    [DateDebutSouhaitee] datetimeoffset NOT NULL,
    [DateFinSouhaitee] datetimeoffset NOT NULL,
    [DureeMinutes] int NOT NULL,
    [Urgence] nvarchar(20) NOT NULL,
    [Priorite] nvarchar(20) NOT NULL,
    [Statut] nvarchar(20) NOT NULL,
    [SalleSouhaiteeId] uniqueidentifier NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_DemandeRencontres] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Demande_ActeursDistincts] CHECK ([DemandeurId] <> [DirigeantId]),
    CONSTRAINT [CK_Demande_Duree] CHECK ([DureeMinutes] >= 15 AND [DureeMinutes] <= 480),
    CONSTRAINT [CK_Demande_Periode] CHECK ([DateFinSouhaitee] > [DateDebutSouhaitee]),
    CONSTRAINT [FK_DemandeRencontres_Salles_SalleSouhaiteeId] FOREIGN KEY ([SalleSouhaiteeId]) REFERENCES [Salles] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_DemandeRencontres_Societes_SocieteId] FOREIGN KEY ([SocieteId]) REFERENCES [Societes] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_DemandeRencontres_Utilisateurs_DemandeurId] FOREIGN KEY ([DemandeurId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_DemandeRencontres_Utilisateurs_DirigeantId] FOREIGN KEY ([DirigeantId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [DemandeParticipants] (
    [Id] uniqueidentifier NOT NULL,
    [DemandeRencontreId] uniqueidentifier NOT NULL,
    [UtilisateurId] uniqueidentifier NULL,
    [NomComplet] nvarchar(200) NULL,
    [Email] nvarchar(256) NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_DemandeParticipants] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Participant_Identite] CHECK (([UtilisateurId] IS NOT NULL AND [NomComplet] IS NULL AND [Email] IS NULL) OR ([UtilisateurId] IS NULL AND [NomComplet] IS NOT NULL AND [Email] IS NOT NULL)),
    CONSTRAINT [FK_DemandeParticipants_DemandeRencontres_DemandeRencontreId] FOREIGN KEY ([DemandeRencontreId]) REFERENCES [DemandeRencontres] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_DemandeParticipants_Utilisateurs_UtilisateurId] FOREIGN KEY ([UtilisateurId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [HistoriqueDemandes] (
    [Id] uniqueidentifier NOT NULL,
    [DemandeRencontreId] uniqueidentifier NOT NULL,
    [AuteurId] uniqueidentifier NOT NULL,
    [TypeEvenement] nvarchar(30) NOT NULL,
    [Commentaire] nvarchar(2000) NULL,
    [StatutAvant] nvarchar(20) NULL,
    [StatutApres] nvarchar(20) NULL,
    [UrgenceAvant] nvarchar(20) NULL,
    [UrgenceApres] nvarchar(20) NULL,
    [PrioriteAvant] nvarchar(20) NULL,
    [PrioriteApres] nvarchar(20) NULL,
    [DateDebutAvant] datetimeoffset NULL,
    [DateDebutApres] datetimeoffset NULL,
    [DateFinAvant] datetimeoffset NULL,
    [DateFinApres] datetimeoffset NULL,
    [SalleAvantId] uniqueidentifier NULL,
    [SalleApresId] uniqueidentifier NULL,
    [RendezVousId] uniqueidentifier NULL,
    [ReunionId] uniqueidentifier NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_HistoriqueDemandes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_HistoriqueDemandes_DemandeRencontres_DemandeRencontreId] FOREIGN KEY ([DemandeRencontreId]) REFERENCES [DemandeRencontres] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_HistoriqueDemandes_Utilisateurs_AuteurId] FOREIGN KEY ([AuteurId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [RendezVous] (
    [Id] uniqueidentifier NOT NULL,
    [DirigeantId] uniqueidentifier NOT NULL,
    [SocieteId] uniqueidentifier NOT NULL,
    [DemandeRencontreId] uniqueidentifier NULL,
    [SalleId] uniqueidentifier NULL,
    [Debut] datetimeoffset NOT NULL,
    [Fin] datetimeoffset NOT NULL,
    [Titre] nvarchar(500) NOT NULL,
    [Statut] nvarchar(20) NOT NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_RendezVous] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_RendezVous_Creneau] CHECK ([Fin] > [Debut]),
    CONSTRAINT [FK_RendezVous_DemandeRencontres_DemandeRencontreId] FOREIGN KEY ([DemandeRencontreId]) REFERENCES [DemandeRencontres] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_RendezVous_Salles_SalleId] FOREIGN KEY ([SalleId]) REFERENCES [Salles] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Reunions] (
    [Id] uniqueidentifier NOT NULL,
    [DirigeantId] uniqueidentifier NOT NULL,
    [SocieteId] uniqueidentifier NOT NULL,
    [DemandeRencontreId] uniqueidentifier NULL,
    [SalleId] uniqueidentifier NULL,
    [Debut] datetimeoffset NOT NULL,
    [Fin] datetimeoffset NOT NULL,
    [Titre] nvarchar(500) NOT NULL,
    [Statut] nvarchar(20) NOT NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_Reunions] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Reunion_Creneau] CHECK ([Fin] > [Debut]),
    CONSTRAINT [FK_Reunions_DemandeRencontres_DemandeRencontreId] FOREIGN KEY ([DemandeRencontreId]) REFERENCES [DemandeRencontres] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Reunions_Salles_SalleId] FOREIGN KEY ([SalleId]) REFERENCES [Salles] ([Id]) ON DELETE NO ACTION
);

CREATE UNIQUE INDEX [IX_AffectationAssistantes_AssistanteId_DirigeantId_SocieteId] ON [AffectationAssistantes] ([AssistanteId], [DirigeantId], [SocieteId]);

CREATE INDEX [IX_AffectationAssistantes_DirigeantId] ON [AffectationAssistantes] ([DirigeantId]);

CREATE INDEX [IX_AffectationAssistantes_SocieteId] ON [AffectationAssistantes] ([SocieteId]);

CREATE UNIQUE INDEX [IX_DemandeParticipants_DemandeRencontreId_Email] ON [DemandeParticipants] ([DemandeRencontreId], [Email]) WHERE [Email] IS NOT NULL;

CREATE UNIQUE INDEX [IX_DemandeParticipants_DemandeRencontreId_UtilisateurId] ON [DemandeParticipants] ([DemandeRencontreId], [UtilisateurId]) WHERE [UtilisateurId] IS NOT NULL;

CREATE INDEX [IX_DemandeParticipants_UtilisateurId] ON [DemandeParticipants] ([UtilisateurId]);

CREATE INDEX [IX_DemandeRencontres_DemandeurId_Statut] ON [DemandeRencontres] ([DemandeurId], [Statut]);

CREATE INDEX [IX_DemandeRencontres_DirigeantId_DateDebutSouhaitee] ON [DemandeRencontres] ([DirigeantId], [DateDebutSouhaitee]);

CREATE INDEX [IX_DemandeRencontres_SalleSouhaiteeId] ON [DemandeRencontres] ([SalleSouhaiteeId]);

CREATE INDEX [IX_DemandeRencontres_SocieteId_DirigeantId_Statut] ON [DemandeRencontres] ([SocieteId], [DirigeantId], [Statut]);

CREATE INDEX [IX_HistoriqueDemandes_AuteurId] ON [HistoriqueDemandes] ([AuteurId]);

CREATE INDEX [IX_HistoriqueDemandes_DemandeRencontreId_DateCreation] ON [HistoriqueDemandes] ([DemandeRencontreId], [DateCreation]);

CREATE UNIQUE INDEX [IX_RefreshTokens_TokenHash] ON [RefreshTokens] ([TokenHash]);

CREATE INDEX [IX_RefreshTokens_UtilisateurId] ON [RefreshTokens] ([UtilisateurId]);

CREATE UNIQUE INDEX [IX_RendezVous_DemandeRencontreId] ON [RendezVous] ([DemandeRencontreId]) WHERE [DemandeRencontreId] IS NOT NULL;

CREATE INDEX [IX_RendezVous_DirigeantId_Debut_Fin] ON [RendezVous] ([DirigeantId], [Debut], [Fin]);

CREATE INDEX [IX_RendezVous_SalleId_Debut_Fin] ON [RendezVous] ([SalleId], [Debut], [Fin]);

CREATE UNIQUE INDEX [IX_Reunions_DemandeRencontreId] ON [Reunions] ([DemandeRencontreId]) WHERE [DemandeRencontreId] IS NOT NULL;

CREATE INDEX [IX_Reunions_DirigeantId_Debut_Fin] ON [Reunions] ([DirigeantId], [Debut], [Fin]);

CREATE INDEX [IX_Reunions_SalleId_Debut_Fin] ON [Reunions] ([SalleId], [Debut], [Fin]);

CREATE INDEX [IX_Salles_SocieteId] ON [Salles] ([SocieteId]);

CREATE UNIQUE INDEX [IX_Utilisateurs_Email] ON [Utilisateurs] ([Email]);

CREATE INDEX [IX_UtilisateurSocietes_SocieteId] ON [UtilisateurSocietes] ([SocieteId]);

CREATE UNIQUE INDEX [IX_UtilisateurSocietes_UtilisateurId_SocieteId_Role] ON [UtilisateurSocietes] ([UtilisateurId], [SocieteId], [Role]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260923090503_AjoutDemandesRencontre', N'10.0.12');

COMMIT;
GO

