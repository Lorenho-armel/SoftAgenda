namespace GestionAgenda.Application.DTOs.Synchronisation;

public sealed record EtatFeuilleResponse(bool Configuree, string? Lien, string Onglet);

public sealed record MessageImport(int Ligne, string Niveau, string Texte);

public sealed record RapportImportResponse(
    int DemandesCreees,
    int IndisponibilitesCreees,
    int LignesIgnorees,
    IReadOnlyList<MessageImport> Messages);

public sealed record LigneFeuilleResponse(
    int Numero,
    string? Date,
    string? HeureDebut,
    string? HeureFin,
    string Type,
    string Objet,
    string Societe,
    string Dirigeant,
    string Lieu,
    string Participants,
    string Demandeur,
    string Priorite,
    string Statut);

public sealed record LignesFeuilleResponse(Guid Id, string Onglet, IReadOnlyList<LigneFeuilleResponse> Lignes);
