using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Application.DTOs.Referentiel;

namespace GestionAgenda.Application.Services.Interfaces;

public interface IReferentielService
{
    Task<IReadOnlyList<SocieteOptionResponse>> ListerSocietesAsync(
        Guid utilisateurId,
        string? recherche,
        CancellationToken cancellationToken = default);

    Task<SocieteDetailResponse> ObtenirSocieteAsync(
        Guid utilisateurId,
        Guid societeId,
        CancellationToken cancellationToken = default);
}
