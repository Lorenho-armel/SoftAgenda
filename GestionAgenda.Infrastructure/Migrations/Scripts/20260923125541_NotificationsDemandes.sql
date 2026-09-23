BEGIN TRANSACTION;
CREATE TABLE [AbonnementsPush] (
    [Id] uniqueidentifier NOT NULL,
    [UtilisateurId] uniqueidentifier NOT NULL,
    [Endpoint] nvarchar(2000) NOT NULL,
    [CleP256dh] nvarchar(200) NOT NULL,
    [Auth] nvarchar(200) NOT NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_AbonnementsPush] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AbonnementsPush_Utilisateurs_UtilisateurId] FOREIGN KEY ([UtilisateurId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Notifications] (
    [Id] uniqueidentifier NOT NULL,
    [DestinataireId] uniqueidentifier NULL,
    [Email] nvarchar(256) NOT NULL,
    [Titre] nvarchar(200) NOT NULL,
    [Message] nvarchar(1000) NOT NULL,
    [DemandeId] uniqueidentifier NOT NULL,
    [Evenement] nvarchar(40) NOT NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Notifications_DemandeRencontres_DemandeId] FOREIGN KEY ([DemandeId]) REFERENCES [DemandeRencontres] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Notifications_Utilisateurs_DestinataireId] FOREIGN KEY ([DestinataireId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE NO ACTION
);

CREATE UNIQUE INDEX [IX_AbonnementsPush_Endpoint] ON [AbonnementsPush] ([Endpoint]);

CREATE INDEX [IX_AbonnementsPush_UtilisateurId] ON [AbonnementsPush] ([UtilisateurId]);

CREATE INDEX [IX_Notifications_DemandeId] ON [Notifications] ([DemandeId]);

CREATE INDEX [IX_Notifications_DestinataireId_DateCreation] ON [Notifications] ([DestinataireId], [DateCreation]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260923125541_NotificationsDemandes', N'10.0.12');

COMMIT;
GO

