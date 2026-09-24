using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionAgenda.Infrastructure.Repositories;

public sealed class ReferentielRepository(ApplicationDbContext context) : IReferentielRepository
{
    public async Task<IReadOnlyList<Societe>> ListerSocietesAsync(
        Guid utilisateurId,
        string? recherche,
        int taille,
        CancellationToken cancellationToken = default)
    {
        var societesMembre = context.UtilisateurSocietes
            .Where(u => u.UtilisateurId == utilisateurId)
            .Select(u => u.SocieteId);
        var requete = context.Societes.AsNoTracking().Where(s => societesMembre.Contains(s.Id));
        if (!string.IsNullOrWhiteSpace(recherche))
        {
            var terme = recherche.Trim();
            requete = requete.Where(s => s.Nom.Contains(terme));
        }

        return await requete.OrderBy(s => s.Nom).Take(taille).ToListAsync(cancellationToken);
    }

    public Task<Societe?> GetSocieteAsync(Guid societeId, CancellationToken cancellationToken = default) =>
        context.Societes.AsNoTracking().FirstOrDefaultAsync(s => s.Id == societeId, cancellationToken);

    public async Task<IReadOnlyList<UtilisateurSociete>> ListerMembresAsync(
        Guid societeId,
        CancellationToken cancellationToken = default) =>
        await context.UtilisateurSocietes
            .AsNoTracking()
            .Include(u => u.Utilisateur)
            .Where(u => u.SocieteId == societeId)
            .OrderBy(u => u.Utilisateur!.Nom)
            .ThenBy(u => u.Utilisateur!.Prenom)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Salle>> ListerSallesActivesAsync(
        Guid societeId,
        CancellationToken cancellationToken = default) =>
        await context.Salles
            .AsNoTracking()
            .Where(s => s.SocieteId == societeId && s.EstActive)
            .OrderBy(s => s.Nom)
            .ToListAsync(cancellationToken);
}
