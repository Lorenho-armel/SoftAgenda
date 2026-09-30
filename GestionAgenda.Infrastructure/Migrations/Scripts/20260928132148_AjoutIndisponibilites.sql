BEGIN TRANSACTION;
CREATE TABLE [Indisponibilites] (
    [Id] uniqueidentifier NOT NULL,
    [DirigeantId] uniqueidentifier NOT NULL,
    [SocieteId] uniqueidentifier NOT NULL,
    [Type] nvarchar(20) NOT NULL,
    [Motif] nvarchar(500) NOT NULL,
    [Debut] datetimeoffset NOT NULL,
    [Fin] datetimeoffset NOT NULL,
    [AuteurId] uniqueidentifier NOT NULL,
    [DateCreation] datetimeoffset NOT NULL,
    [DateModification] datetimeoffset NOT NULL,
    CONSTRAINT [PK_Indisponibilites] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Indisponibilites_Creneau] CHECK ([Fin] > [Debut]),
    CONSTRAINT [FK_Indisponibilites_Societes_SocieteId] FOREIGN KEY ([SocieteId]) REFERENCES [Societes] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Indisponibilites_Utilisateurs_AuteurId] FOREIGN KEY ([AuteurId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Indisponibilites_Utilisateurs_DirigeantId] FOREIGN KEY ([DirigeantId]) REFERENCES [Utilisateurs] ([Id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_Indisponibilites_AuteurId] ON [Indisponibilites] ([AuteurId]);

CREATE INDEX [IX_Indisponibilites_DirigeantId_Debut_Fin] ON [Indisponibilites] ([DirigeantId], [Debut], [Fin]);

CREATE INDEX [IX_Indisponibilites_SocieteId] ON [Indisponibilites] ([SocieteId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260928132148_AjoutIndisponibilites', N'10.0.12');

COMMIT;
GO

