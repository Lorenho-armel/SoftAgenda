using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;

namespace GestionAgenda.Domain.Interfaces;

public interface IDemandeRencontreRepository
{
    Task AddAsync(DemandeRencontre demande, CancellationToken cancellationToken = default);

    Task<DemandeRencontre?> GetByIdAsync(Guid id, bool suivi, CancellationToken cancellationToken = default);

    Task<Page<DemandeRencontre>> RechercherVisiblesAsync(
        Guid utilisateurId,
        DemandeRencontreFiltre filtre,
        CancellationToken cancellationToken = default);
}
