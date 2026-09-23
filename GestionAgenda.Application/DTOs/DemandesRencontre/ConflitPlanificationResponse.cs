using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public sealed record ConflitPlanificationResponse(
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
