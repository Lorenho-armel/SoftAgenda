using GestionAgenda.Domain.Entities;

namespace GestionAgenda.Domain.Demandes;

public sealed record LectureTableauAssistante(
    CompteursTableau Compteurs,
    IReadOnlyList<DemandeRencontre> ATraiterMaintenant,
    IReadOnlyList<RencontreTableau> RencontresAujourdhui,
    IReadOnlyList<RencontreTableau> ProchainesRencontres);
