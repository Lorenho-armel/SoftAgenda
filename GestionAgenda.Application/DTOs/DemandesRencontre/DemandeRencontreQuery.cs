using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public record DemandeRencontreQuery(
    int Page = 1,
    int Size = 20,
    string? Search = null,
    string? SortBy = null,
    string SortDirection = "asc",
    StatutDemande? Statut = null,
    Urgence? Urgence = null,
    Priorite? Priorite = null,
    TypeDemande? Type = null,
    Guid? SocieteId = null,
    DateTimeOffset? DateDebut = null,
    DateTimeOffset? DateFin = null);
