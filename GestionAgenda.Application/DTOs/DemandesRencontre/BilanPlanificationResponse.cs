namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public sealed record BilanPlanificationResponse(
    DateTimeOffset Debut,
    DateTimeOffset Fin,
    bool PeutPlanifier,
    IReadOnlyList<ConflitPlanificationResponse> Conflits);
