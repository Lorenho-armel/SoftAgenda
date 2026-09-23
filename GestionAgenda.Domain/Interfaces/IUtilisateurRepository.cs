using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Interfaces;

public interface IUtilisateurRepository
{
    Task<Utilisateur?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<Utilisateur?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RoleSociete>> GetRolesAsync(Guid utilisateurId, CancellationToken cancellationToken = default);
}
