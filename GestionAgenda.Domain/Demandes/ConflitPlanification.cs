using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

public sealed record ConflitPlanification(
    TypeConflit Nature,
    bool Bloquant,
    string Message,
    Guid? OccurrenceId,
    string? Titre,
    DateTimeOffset? Debut,
    DateTimeOffset? Fin,
    Guid? ParticipantId,
    string? ParticipantNom,
    Guid? SalleId,
    string? SalleNom);
