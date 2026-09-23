using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public record CreerDemandeRencontreRequest(
    Guid DirigeantId,
    Guid SocieteId,
    TypeDemande Type,
    string Motif,
    DateTimeOffset DateDebutSouhaitee,
    DateTimeOffset DateFinSouhaitee,
    int DureeMinutes,
    Urgence Urgence,
    Priorite Priorite,
    Guid? SalleSouhaiteeId,
    IReadOnlyList<ParticipantRequest>? Participants);
