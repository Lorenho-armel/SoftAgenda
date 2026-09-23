using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionAgenda.Infrastructure.Repositories;

public sealed class UtilisateurRepository(ApplicationDbContext context) : IUtilisateurRepository
{
    public Task<Utilisateur?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        context.Utilisateurs.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public Task<Utilisateur?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        context.Utilisateurs.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Utilisateur>> GetByIdsAsync(
        IReadOnlyCollection<Guid> ids,
        CancellationToken cancellationToken = default)
    {
        var distincts = ids.Distinct().ToList();
        if (distincts.Count == 0)
        {
            return [];
        }

        return await context.Utilisateurs.Where(u => distincts.Contains(u.Id)).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<RoleSociete>> GetRolesAsync(
        Guid utilisateurId,
        CancellationToken cancellationToken = default)
    {
        var roles = await context.UtilisateurSocietes
            .Where(u => u.UtilisateurId == utilisateurId)
            .Select(u => u.Role)
            .Distinct()
            .ToListAsync(cancellationToken);
        return roles;
    }
}
