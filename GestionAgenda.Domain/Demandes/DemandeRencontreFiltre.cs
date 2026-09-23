using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

public sealed record DemandeRencontreFiltre(
    int Page,
    int Size,
    string? Search,
    string? SortBy,
    bool Descendant,
    StatutDemande? Statut,
    Urgence? Urgence,
    Priorite? Priorite,
    TypeDemande? Type,
    Guid? SocieteId,
    DateTimeOffset? DateDebut,
    DateTimeOffset? DateFin);
