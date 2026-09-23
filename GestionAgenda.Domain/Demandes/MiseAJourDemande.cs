using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

public sealed record MiseAJourDemande(
    TypeDemande Type,
    string Motif,
    DateTimeOffset DateDebutSouhaitee,
    DateTimeOffset DateFinSouhaitee,
    int DureeMinutes,
    Guid? SalleSouhaiteeId,
    IReadOnlyList<NouveauParticipant> Participants);
