using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

public sealed record NouvelleDemande(
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
    Guid? SalleSouhaiteeId,
    IReadOnlyList<NouveauParticipant> Participants);
