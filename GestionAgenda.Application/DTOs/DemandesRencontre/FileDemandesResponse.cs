using GestionAgenda.Application.DTOs;

namespace GestionAgenda.Application.DTOs.DemandesRencontre;

public sealed record FileDemandesResponse(
    PaginatedResult<DemandeRencontreResumeResponse> Demandes,
    CompteursFileResponse Compteurs,
    IReadOnlyList<PersonneOptionResponse> Demandeurs,
    IReadOnlyList<SocieteOptionResponse> Societes);
