namespace GestionAgenda.Application.DTOs.Synchronisation;

public sealed record EtatFeuilleResponse(bool Configuree, string? Lien, string Onglet);

public sealed record MessageImport(int Ligne, string Niveau, string Texte);

public sealed record RapportImportResponse(
    int DemandesCreees,
    int IndisponibilitesCreees,
    int LignesIgnorees,
    IReadOnlyList<MessageImport> Messages);
