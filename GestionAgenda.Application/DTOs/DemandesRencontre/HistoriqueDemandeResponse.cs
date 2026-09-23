using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public record HistoriqueDemandeResponse(
    Guid Id,
    Guid AuteurId,
    TypeEvenementDemande TypeEvenement,
    string? Commentaire,
    StatutDemande? StatutAvant,
    StatutDemande? StatutApres,
    Urgence? UrgenceAvant,
    Urgence? UrgenceApres,
    Priorite? PrioriteAvant,
    Priorite? PrioriteApres,
    DateTimeOffset? DateDebutAvant,
    DateTimeOffset? DateDebutApres,
    DateTimeOffset? DateFinAvant,
    DateTimeOffset? DateFinApres,
    Guid? SalleAvantId,
    Guid? SalleApresId,
    Guid? RendezVousId,
    Guid? ReunionId,
    DateTimeOffset DateCreation);
