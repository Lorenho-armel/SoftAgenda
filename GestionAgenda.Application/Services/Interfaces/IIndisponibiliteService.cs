using GestionAgenda.Application.DTOs.Indisponibilites;

namespace GestionAgenda.Application.Services.Interfaces;

public interface IIndisponibiliteService
{
    Task<IReadOnlyList<DirigeantGereResponse>> ListerDirigeantsGeresAsync(
        Guid utilisateurId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<IndisponibiliteResponse>> ListerAsync(
        Guid utilisateurId,
        DateTimeOffset debut,
        DateTimeOffset fin,
        CancellationToken cancellationToken = default);

    Task<IndisponibiliteResponse> CreerAsync(
        Guid utilisateurId,
        CreerIndisponibiliteRequest request,
        CancellationToken cancellationToken = default);

    Task SupprimerAsync(Guid utilisateurId, Guid id, CancellationToken cancellationToken = default);
}
