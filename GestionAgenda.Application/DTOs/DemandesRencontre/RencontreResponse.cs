using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public sealed record RencontreResponse(
    TypeDemande Type,
    DateTimeOffset Debut,
    DateTimeOffset Fin,
    Guid? SalleId,
    string? SalleNom,
    StatutOccurrence Statut);
