using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionAgenda.Infrastructure.Repositories;

public sealed class PlanificationRepository(ApplicationDbContext context) : IPlanificationRepository
{
    public Task<Salle?> GetSalleAsync(Guid salleId, CancellationToken cancellationToken = default) =>
        context.Salles.FirstOrDefaultAsync(s => s.Id == salleId, cancellationToken);

    public async Task<IReadOnlyList<OccupationCalendrier>> OccupationsDirigeantAsync(
        Guid dirigeantId,
        Intervalle creneau,
        Guid demandeExclueId,
        CancellationToken cancellationToken = default)
    {
        var identifiants = new[] { dirigeantId };
        var rendezVous = await RendezVousDesDirigeantsAsync(identifiants, creneau, demandeExclueId, cancellationToken);
        var reunions = await ReunionsDesDirigeantsAsync(identifiants, creneau, demandeExclueId, cancellationToken);
        var indisponibilites = await IndisponibilitesAsync(identifiants, creneau, cancellationToken);
        return rendezVous.Concat(reunions).Concat(indisponibilites).ToList();
    }

    public async Task<IReadOnlyList<OccupationCalendrier>> OccupationsParticipantsAsync(
        IReadOnlyCollection<Guid> utilisateurIds,
        Intervalle creneau,
        Guid demandeExclueId,
        CancellationToken cancellationToken = default)
    {
        if (utilisateurIds.Count == 0)
        {
            return [];
        }

        var identifiants = utilisateurIds.Distinct().ToList();
        var commeDirigeants = await RendezVousDesDirigeantsAsync(identifiants, creneau, demandeExclueId, cancellationToken);
        commeDirigeants.AddRange(await ReunionsDesDirigeantsAsync(identifiants, creneau, demandeExclueId, cancellationToken));
        commeDirigeants.AddRange(await IndisponibilitesAsync(identifiants, creneau, cancellationToken));
        var commeInvites = await RendezVousDesInvitesAsync(identifiants, creneau, demandeExclueId, cancellationToken);
        commeInvites.AddRange(await ReunionsDesInvitesAsync(identifiants, creneau, demandeExclueId, cancellationToken));
        return commeDirigeants
            .Concat(commeInvites)
            .DistinctBy(occupation => (occupation.OccurrenceId, occupation.PersonneId))
            .ToList();
    }

    public async Task<IReadOnlyList<OccupationSalle>> OccupationsSalleAsync(
        Guid salleId,
        Intervalle creneau,
        Guid demandeExclueId,
        CancellationToken cancellationToken = default)
    {
        var rendezVous = await RendezVousOccupes(creneau, demandeExclueId)
            .Where(r => r.SalleId == salleId)
            .Select(r => new OccupationSalle(r.Id, r.Titre, r.Debut, r.Fin))
            .ToListAsync(cancellationToken);
        var reunions = await ReunionsOccupees(creneau, demandeExclueId)
            .Where(r => r.SalleId == salleId)
            .Select(r => new OccupationSalle(r.Id, r.Titre, r.Debut, r.Fin))
            .ToListAsync(cancellationToken);
        return rendezVous.Concat(reunions).ToList();
    }

    public async Task<IReadOnlyList<OccurrenceARappeler>> ListerARappelerAsync(
        DateTimeOffset maintenant,
        DateTimeOffset limite,
        CancellationToken cancellationToken = default)
    {
        var rendezVous = await EcheancesRendezVous(maintenant, limite).ToListAsync(cancellationToken);
        var reunions = await EcheancesReunions(maintenant, limite).ToListAsync(cancellationToken);
        return rendezVous.Concat(reunions).ToList();
    }

    private IQueryable<OccurrenceARappeler> EcheancesRendezVous(DateTimeOffset maintenant, DateTimeOffset limite) =>
        from item in context.RendezVous
        join demande in context.DemandesRencontre on item.DemandeRencontreId equals demande.Id
        where item.Statut == StatutOccurrence.Planifie
            && item.Debut > maintenant
            && item.Debut <= limite
            && demande.Statut == StatutDemande.Planifiee
        select new OccurrenceARappeler(demande.Id, item.Debut, item.DateModification);

    private IQueryable<OccurrenceARappeler> EcheancesReunions(DateTimeOffset maintenant, DateTimeOffset limite) =>
        from item in context.Reunions
        join demande in context.DemandesRencontre on item.DemandeRencontreId equals demande.Id
        where item.Statut == StatutOccurrence.Planifie
            && item.Debut > maintenant
            && item.Debut <= limite
            && demande.Statut == StatutDemande.Planifiee
        select new OccurrenceARappeler(demande.Id, item.Debut, item.DateModification);

    private async Task<List<OccupationCalendrier>> RendezVousDesDirigeantsAsync(
        IReadOnlyCollection<Guid> identifiants,
        Intervalle creneau,
        Guid demandeExclueId,
        CancellationToken cancellationToken) =>
        await (
            from rendezVous in RendezVousOccupes(creneau, demandeExclueId)
            join utilisateur in context.Utilisateurs on rendezVous.DirigeantId equals utilisateur.Id
            where identifiants.Contains(rendezVous.DirigeantId)
            select new OccupationCalendrier(
                rendezVous.Id,
                utilisateur.Id,
                utilisateur.Prenom + " " + utilisateur.Nom,
                rendezVous.Titre,
                rendezVous.Debut,
                rendezVous.Fin)).ToListAsync(cancellationToken);

    private async Task<List<OccupationCalendrier>> ReunionsDesDirigeantsAsync(
        IReadOnlyCollection<Guid> identifiants,
        Intervalle creneau,
        Guid demandeExclueId,
        CancellationToken cancellationToken) =>
        await (
            from reunion in ReunionsOccupees(creneau, demandeExclueId)
            join utilisateur in context.Utilisateurs on reunion.DirigeantId equals utilisateur.Id
            where identifiants.Contains(reunion.DirigeantId)
            select new OccupationCalendrier(
                reunion.Id,
                utilisateur.Id,
                utilisateur.Prenom + " " + utilisateur.Nom,
                reunion.Titre,
                reunion.Debut,
                reunion.Fin)).ToListAsync(cancellationToken);

    private async Task<List<OccupationCalendrier>> RendezVousDesInvitesAsync(
        IReadOnlyCollection<Guid> identifiants,
        Intervalle creneau,
        Guid demandeExclueId,
        CancellationToken cancellationToken) =>
        await (
            from rendezVous in RendezVousOccupes(creneau, demandeExclueId)
            join participant in context.DemandeParticipants on rendezVous.DemandeRencontreId equals participant.DemandeRencontreId
            join utilisateur in context.Utilisateurs on participant.UtilisateurId equals utilisateur.Id
            where participant.UtilisateurId != null && identifiants.Contains(participant.UtilisateurId.Value)
            select new OccupationCalendrier(
                rendezVous.Id,
                utilisateur.Id,
                utilisateur.Prenom + " " + utilisateur.Nom,
                rendezVous.Titre,
                rendezVous.Debut,
                rendezVous.Fin)).ToListAsync(cancellationToken);

    private async Task<List<OccupationCalendrier>> ReunionsDesInvitesAsync(
        IReadOnlyCollection<Guid> identifiants,
        Intervalle creneau,
        Guid demandeExclueId,
        CancellationToken cancellationToken) =>
        await (
            from reunion in ReunionsOccupees(creneau, demandeExclueId)
            join participant in context.DemandeParticipants on reunion.DemandeRencontreId equals participant.DemandeRencontreId
            join utilisateur in context.Utilisateurs on participant.UtilisateurId equals utilisateur.Id
            where participant.UtilisateurId != null && identifiants.Contains(participant.UtilisateurId.Value)
            select new OccupationCalendrier(
                reunion.Id,
                utilisateur.Id,
                utilisateur.Prenom + " " + utilisateur.Nom,
                reunion.Titre,
                reunion.Debut,
                reunion.Fin)).ToListAsync(cancellationToken);

    private async Task<List<OccupationCalendrier>> IndisponibilitesAsync(
        IReadOnlyCollection<Guid> identifiants,
        Intervalle creneau,
        CancellationToken cancellationToken)
    {
        var lignes = await (
            from indisponibilite in context.Indisponibilites
            join utilisateur in context.Utilisateurs on indisponibilite.DirigeantId equals utilisateur.Id
            where identifiants.Contains(indisponibilite.DirigeantId)
                && indisponibilite.Debut < creneau.Fin
                && indisponibilite.Fin > creneau.Debut
            select new
            {
                indisponibilite.Id,
                indisponibilite.DirigeantId,
                utilisateur.Prenom,
                utilisateur.Nom,
                indisponibilite.Type,
                indisponibilite.Motif,
                indisponibilite.Debut,
                indisponibilite.Fin,
            }).ToListAsync(cancellationToken);
        return lignes.Select(ligne => new OccupationCalendrier(
                ligne.Id,
                ligne.DirigeantId,
                $"{ligne.Prenom} {ligne.Nom}",
                LibellesIndisponibilite.Titre(ligne.Type, ligne.Motif),
                ligne.Debut,
                ligne.Fin))
            .ToList();
    }

    private IQueryable<RendezVous> RendezVousOccupes(Intervalle creneau, Guid demandeExclueId) =>
        context.RendezVous.Where(rendezVous =>
            rendezVous.Statut != StatutOccurrence.Annule
            && rendezVous.Debut < creneau.Fin
            && rendezVous.Fin > creneau.Debut
            && rendezVous.DemandeRencontreId != demandeExclueId);

    private IQueryable<Reunion> ReunionsOccupees(Intervalle creneau, Guid demandeExclueId) =>
        context.Reunions.Where(reunion =>
            reunion.Statut != StatutOccurrence.Annule
            && reunion.Debut < creneau.Fin
            && reunion.Fin > creneau.Debut
            && reunion.DemandeRencontreId != demandeExclueId);
}
