using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionAgenda.Infrastructure.Repositories;

public sealed class IndisponibiliteRepository(ApplicationDbContext context) : IIndisponibiliteRepository
{
    public Task AddAsync(Indisponibilite indisponibilite, CancellationToken cancellationToken = default)
    {
        context.Indisponibilites.Add(indisponibilite);
        return Task.CompletedTask;
    }

    public void Remove(Indisponibilite indisponibilite) => context.Indisponibilites.Remove(indisponibilite);

    public Task<Indisponibilite?> GetByIdAsync(Guid id, bool suivi, CancellationToken cancellationToken = default)
    {
        var requete = suivi ? context.Indisponibilites.AsTracking() : context.Indisponibilites;
        return requete.FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Indisponibilite>> ListerAsync(
        IReadOnlyCollection<Guid> dirigeantIds,
        Intervalle periode,
        CancellationToken cancellationToken = default)
    {
        if (dirigeantIds.Count == 0)
        {
            return [];
        }

        var identifiants = dirigeantIds.Distinct().ToList();
        return await context.Indisponibilites
            .Where(i => identifiants.Contains(i.DirigeantId) && i.Debut < periode.Fin && i.Fin > periode.Debut)
            .OrderBy(i => i.Debut)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DirigeantGere>> ListerDirigeantsGeresAsync(
        Guid utilisateurId,
        CancellationToken cancellationToken = default)
    {
        var commeDirigeant =
            from membre in context.UtilisateurSocietes
            where membre.UtilisateurId == utilisateurId && membre.Role == RoleSociete.Dirigeant
            select new { DirigeantId = membre.UtilisateurId, membre.SocieteId };
        var commeAssistante =
            from affectation in context.AffectationAssistantes
            where affectation.EstActive && affectation.AssistanteId == utilisateurId
            select new { affectation.DirigeantId, affectation.SocieteId };
        var lignes = await (
            from paire in commeDirigeant.Union(commeAssistante)
            join dirigeant in context.Utilisateurs on paire.DirigeantId equals dirigeant.Id
            join societe in context.Societes on paire.SocieteId equals societe.Id
            select new
            {
                paire.DirigeantId,
                DirigeantNom = dirigeant.Prenom + " " + dirigeant.Nom,
                paire.SocieteId,
                SocieteNom = societe.Nom,
            })
            .ToListAsync(cancellationToken);
        return lignes
            .OrderBy(l => l.DirigeantNom)
            .ThenBy(l => l.SocieteNom)
            .Select(l => new DirigeantGere(l.DirigeantId, l.DirigeantNom, l.SocieteId, l.SocieteNom))
            .ToList();
    }
}
