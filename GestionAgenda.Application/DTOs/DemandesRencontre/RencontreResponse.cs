using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public sealed record RencontreResponse(
    TypeDemande Type,
    DateTimeOffset Debut,
    DateTimeOffset Fin,
    string? SalleNom,
    StatutOccurrence Statut);
