using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public record ChangerStatutDemandeRequest(
    StatutDemande Statut,
    string? Commentaire,
    DateTimeOffset? DateDebutSouhaitee,
    DateTimeOffset? DateFinSouhaitee,
    DateTimeOffset? DebutPlanifie,
    Guid? SalleId);
