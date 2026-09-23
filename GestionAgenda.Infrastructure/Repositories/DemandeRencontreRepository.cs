using System.Linq.Expressions;
using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionAgenda.Infrastructure.Repositories;

public sealed class DemandeRencontreRepository(ApplicationDbContext context) : IDemandeRencontreRepository
{
    public Task AddAsync(DemandeRencontre demande, CancellationToken cancellationToken = default)
    {
        context.DemandesRencontre.Add(demande);
        return Task.CompletedTask;
    }

    public Task<DemandeRencontre?> GetByIdAsync(
        Guid id,
        bool suivi,
        CancellationToken cancellationToken = default)
    {
        IQueryable<DemandeRencontre> requete = context.DemandesRencontre
            .Include(d => d.Participants)
            .Include(d => d.Historique)
            .Include(d => d.RendezVous)
            .Include(d => d.Reunion)
            .AsSplitQuery();
        if (suivi)
        {
            requete = requete.AsTracking();
        }

        return requete.FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<Page<DemandeRencontre>> RechercherVisiblesAsync(
        Guid utilisateurId,
        DemandeRencontreFiltre filtre,
        CancellationToken cancellationToken = default)
    {
        var requete = AppliquerFiltres(Visibles(utilisateurId), filtre);
        var total = await requete.CountAsync(cancellationToken);
        var items = await Trier(requete, filtre)
            .Skip((filtre.Page - 1) * filtre.Size)
            .Take(filtre.Size)
            .ToListAsync(cancellationToken);
        return new Page<DemandeRencontre>(items, total);
    }

    private IQueryable<DemandeRencontre> Visibles(Guid utilisateurId) =>
        context.DemandesRencontre.Where(d =>
            d.DemandeurId == utilisateurId
            || d.DirigeantId == utilisateurId
            || context.AffectationAssistantes.Any(a =>
                a.EstActive
                && a.AssistanteId == utilisateurId
                && a.DirigeantId == d.DirigeantId
                && a.SocieteId == d.SocieteId));

    private static IQueryable<DemandeRencontre> AppliquerFiltres(
        IQueryable<DemandeRencontre> requete,
        DemandeRencontreFiltre filtre)
    {
        if (!string.IsNullOrWhiteSpace(filtre.Search))
        {
            var terme = filtre.Search.Trim();
            requete = requete.Where(d => d.Motif.Contains(terme));
        }

        if (filtre.Statut.HasValue)
        {
            requete = requete.Where(d => d.Statut == filtre.Statut);
        }

        if (filtre.Urgence.HasValue)
        {
            requete = requete.Where(d => d.Urgence == filtre.Urgence);
        }

        if (filtre.Priorite.HasValue)
        {
            requete = requete.Where(d => d.Priorite == filtre.Priorite);
        }

        if (filtre.Type.HasValue)
        {
            requete = requete.Where(d => d.Type == filtre.Type);
        }

        if (filtre.SocieteId.HasValue)
        {
            requete = requete.Where(d => d.SocieteId == filtre.SocieteId);
        }

        if (filtre.DateDebut.HasValue)
        {
            requete = requete.Where(d => d.DateDebutSouhaitee >= filtre.DateDebut);
        }

        if (filtre.DateFin.HasValue)
        {
            requete = requete.Where(d => d.DateDebutSouhaitee <= filtre.DateFin);
        }

        return requete;
    }

    private static IQueryable<DemandeRencontre> Trier(
        IQueryable<DemandeRencontre> requete,
        DemandeRencontreFiltre filtre)
    {
        if (string.IsNullOrWhiteSpace(filtre.SortBy))
        {
            return requete
                .OrderBy(d => d.Urgence == Urgence.Critique ? 0 : d.Urgence == Urgence.Urgent ? 1 : 2)
                .ThenBy(d => d.Priorite == Priorite.Critique ? 0 : d.Priorite == Priorite.Haute ? 1 : d.Priorite == Priorite.Moyenne ? 2 : 3)
                .ThenBy(d => d.DateDebutSouhaitee);
        }

        return filtre.SortBy.Trim().ToLowerInvariant() switch
        {
            "urgence" => Ordre(requete, d => d.Urgence == Urgence.Critique ? 0 : d.Urgence == Urgence.Urgent ? 1 : 2, filtre.Descendant),
            "priorite" => Ordre(requete, d => d.Priorite == Priorite.Critique ? 0 : d.Priorite == Priorite.Haute ? 1 : d.Priorite == Priorite.Moyenne ? 2 : 3, filtre.Descendant),
            "datedebutsouhaitee" => Ordre(requete, d => d.DateDebutSouhaitee, filtre.Descendant),
            "datecreation" => Ordre(requete, d => d.DateCreation, filtre.Descendant),
            "statut" => Ordre(requete, d => d.Statut, filtre.Descendant),
            _ => throw new DomainException("Le tri demandé n'est pas autorisé."),
        };
    }

    private static IOrderedQueryable<DemandeRencontre> Ordre<TCle>(
        IQueryable<DemandeRencontre> requete,
        Expression<Func<DemandeRencontre, TCle>> cle,
        bool descendant) =>
        descendant ? requete.OrderByDescending(cle) : requete.OrderBy(cle);
}
