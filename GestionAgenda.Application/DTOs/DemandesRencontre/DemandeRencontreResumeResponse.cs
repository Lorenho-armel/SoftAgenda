using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public record DemandeRencontreResumeResponse(
    Guid Id,
    Guid DemandeurId,
    Guid DirigeantId,
    Guid SocieteId,
    TypeDemande Type,
    string Motif,
    DateTimeOffset DateDebutSouhaitee,
    DateTimeOffset DateFinSouhaitee,
    int DureeMinutes,
    Urgence Urgence,
    Priorite Priorite,
    StatutDemande Statut,
    Guid? SalleSouhaiteeId,
    DateTimeOffset DateCreation,
    string DemandeurNom,
    string SocieteNom);
