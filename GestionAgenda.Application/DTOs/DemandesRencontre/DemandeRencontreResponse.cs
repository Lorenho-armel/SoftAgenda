using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public record DemandeRencontreResponse(
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
    Guid? RendezVousId,
    Guid? ReunionId,
    DateTimeOffset DateCreation,
    DateTimeOffset DateModification,
    string DemandeurNom,
    string SocieteNom,
    IReadOnlyList<ParticipantResponse> Participants,
    IReadOnlyList<HistoriqueDemandeResponse> Historique)
{
    public bool EstGestionnaire { get; init; }
}
