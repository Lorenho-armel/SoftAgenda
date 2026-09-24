using GestionAgenda.Domain.Entities;

namespace GestionAgenda.Domain.Interfaces;

public interface IReferentielRepository
{
    Task<IReadOnlyList<Societe>> ListerSocietesAsync(
        Guid utilisateurId,
        string? recherche,
        int taille,
        CancellationToken cancellationToken = default);

    Task<Societe?> GetSocieteAsync(Guid societeId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<UtilisateurSociete>> ListerMembresAsync(
        Guid societeId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Salle>> ListerSallesActivesAsync(
        Guid societeId,
        CancellationToken cancellationToken = default);
}
