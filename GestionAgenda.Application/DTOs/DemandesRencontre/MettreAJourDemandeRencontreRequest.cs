using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public record MettreAJourDemandeRencontreRequest(
    TypeDemande Type,
    string Motif,
    DateTimeOffset DateDebutSouhaitee,
    DateTimeOffset DateFinSouhaitee,
    int DureeMinutes,
    Guid? SalleSouhaiteeId,
    IReadOnlyList<ParticipantRequest>? Participants);
