using System.Linq.Expressions;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionAgenda.Infrastructure.Repositories;

public sealed class TableauAssistanteRepository(ApplicationDbContext context) : ITableauAssistanteRepository
{
    public async Task<LectureTableauAssistante> ObtenirAsync(
        Guid assistanteId,
        Intervalle jour,
        CancellationToken cancellationToken = default)
    {
        var perimetre = Perimetre(assistanteId);
        var compteurs = await CompterAsync(perimetre, jour, cancellationToken);
        var aTraiter = await ListerATraiterAsync(perimetre, cancellationToken);
        var aujourdhui = await ListerRencontresAsync(
            perimetre, TableauAssistante.DuJour(jour.Debut, jour.Fin), TableauAssistante.TailleAujourdhui, cancellationToken);
        var prochaines = await ListerRencontresAsync(
            perimetre, TableauAssistante.Apres(jour.Fin), TableauAssistante.TailleProchaines, cancellationToken);
        return new LectureTableauAssistante(compteurs, aTraiter, aujourdhui, prochaines);
    }

    private IQueryable<DemandeRencontre> Perimetre(Guid assistanteId) =>
        context.DemandesRencontre.Where(demande =>
            context.AffectationAssistantes.Any(affectation =>
                affectation.EstActive
                && affectation.AssistanteId == assistanteId
                && affectation.DirigeantId == demande.DirigeantId
                && affectation.SocieteId == demande.SocieteId));

    private static async Task<CompteursTableau> CompterAsync(
        IQueryable<DemandeRencontre> perimetre,
        Intervalle jour,
        CancellationToken cancellationToken)
    {
        return new CompteursTableau(
            await perimetre.CountAsync(TableauAssistante.ATraiter, cancellationToken),
            await perimetre.CountAsync(TableauAssistante.Urgentes, cancellationToken),
            await perimetre.CountAsync(TableauAssistante.Critiques, cancellationToken),
            await perimetre.CountAsync(TableauAssistante.Prioritaires, cancellationToken),
            await perimetre.CountAsync(TableauAssistante.Acceptees, cancellationToken),
            await perimetre.CountAsync(TableauAssistante.Reportees, cancellationToken),
            await perimetre.CountAsync(TableauAssistante.DuJour(jour.Debut, jour.Fin), cancellationToken));
    }

    private static async Task<IReadOnlyList<DemandeRencontre>> ListerATraiterAsync(
        IQueryable<DemandeRencontre> perimetre,
        CancellationToken cancellationToken) =>
        await ClassementFile.Appliquer(perimetre.Where(TableauAssistante.ATraiter))
            .Include(demande => demande.Demandeur)
            .Include(demande => demande.Societe)
            .Take(TableauAssistante.TailleATraiter)
            .ToListAsync(cancellationToken);

    private static async Task<IReadOnlyList<RencontreTableau>> ListerRencontresAsync(
        IQueryable<DemandeRencontre> perimetre,
        Expression<Func<DemandeRencontre, bool>> critere,
        int taille,
        CancellationToken cancellationToken) =>
        await perimetre
            .Where(critere)
            .OrderBy(demande => demande.RendezVous != null ? demande.RendezVous.Debut : demande.Reunion!.Debut)
            .Take(taille)
            .Select(demande => new RencontreTableau(
                demande.Id,
                demande.Motif,
                demande.Urgence,
                demande.Priorite,
                demande.RendezVous != null ? demande.RendezVous.Debut : demande.Reunion!.Debut,
                demande.RendezVous != null ? demande.RendezVous.Fin : demande.Reunion!.Fin,
                demande.Dirigeant!.Prenom + " " + demande.Dirigeant.Nom,
                demande.Societe!.Nom))
            .ToListAsync(cancellationToken);
}
