namespace GestionAgenda.Application.DTOs.Synchronisation;

public sealed record EtatAgendaGoogleResponse(bool Configuree, string? CompteService, string Lien);

public sealed record AccesAgendaGoogleResponse(
    Guid DirigeantId,
    string DirigeantNom,
    string Agenda,
    bool Accessible,
    string Message);
