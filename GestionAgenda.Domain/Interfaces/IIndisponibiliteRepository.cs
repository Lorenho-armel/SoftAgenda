using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;

namespace GestionAgenda.Domain.Interfaces;

public interface IIndisponibiliteRepository
{
    Task AddAsync(Indisponibilite indisponibilite, CancellationToken cancellationToken = default);

    void Remove(Indisponibilite indisponibilite);

    Task<Indisponibilite?> GetByIdAsync(Guid id, bool suivi, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Indisponibilite>> ListerAsync(
        IReadOnlyCollection<Guid> dirigeantIds,
        Intervalle periode,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<DirigeantGere>> ListerDirigeantsGeresAsync(
        Guid utilisateurId,
        CancellationToken cancellationToken = default);
}
