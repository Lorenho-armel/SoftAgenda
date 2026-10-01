using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Infrastructure.Context;
using GestionAgenda.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GestionAgenda.Infrastructure.Synchronisation;

public sealed class SynchronisationCalendrier(
    ApplicationDbContext contexte,
    IClientCalendrier calendrier,
    IOptions<GoogleCalendarOptions> options,
    ILogger<SynchronisationCalendrier> journal)
{
    private readonly GoogleCalendarOptions configuration = options.Value;

    public async Task SynchroniserDemandeAsync(Guid demandeId)
    {
        if (!configuration.EstConfigure)
        {
            return;
        }

        var demande = await contexte.DemandesRencontre
            .Include(d => d.Participants)
            .Include(d => d.Demandeur)
            .Include(d => d.Dirigeant)
            .Include(d => d.Societe)
            .Include(d => d.RendezVous)
            .Include(d => d.Reunion)
            .AsSplitQuery()
            .FirstOrDefaultAsync(d => d.Id == demandeId);
        if (demande?.Dirigeant is null)
        {
            journal.LogWarning("[Sync Agenda] Demande {Id} ou son dirigeant introuvable : rien à publier", demandeId);
            return;
        }

        var agenda = configuration.AgendaDe(demande.Dirigeant.Email);
        var identifiant = EvenementsAgenda.Identifiant(demande.Id);
        if (Rencontre(demande) is not { } rencontre)
        {
            await calendrier.SupprimerAsync(agenda, identifiant);
            journal.LogInformation(
                "[Sync Agenda] Demande {Id} sans rencontre active (statut {Statut}) : événement retiré de l'agenda {Agenda}",
                demande.Id,
                demande.Statut,
                agenda);
            return;
        }

        var evenement = EvenementsAgenda.Rencontre(
            new RencontreAPublier(
                demande.Id,
                demande.Type,
                demande.Motif,
                demande.Societe?.Nom ?? string.Empty,
                rencontre.Debut,
                rencontre.Fin,
                await NomSalleAsync(rencontre.SalleId),
                NomComplet(demande.Demandeur),
                await ParticipantsAsync(demande),
                demande.Priorite),
            configuration.UrlApplication);
        await calendrier.EnregistrerAsync(agenda, evenement);
        journal.LogInformation(
            "[Sync Agenda] Demande {Id} publiée dans l'agenda {Agenda} : « {Titre} », {Debut:dd/MM/yyyy HH:mm}-{Fin:HH:mm}",
            demande.Id,
            agenda,
            evenement.Titre,
            evenement.Debut,
            evenement.Fin);
    }

    public async Task SynchroniserIndisponibiliteAsync(Guid indisponibiliteId)
    {
        if (!configuration.EstConfigure)
        {
            return;
        }

        var indisponibilite = await contexte.Indisponibilites.FirstOrDefaultAsync(i => i.Id == indisponibiliteId);
        if (indisponibilite is null)
        {
            return;
        }

        var personnes = await contexte.Utilisateurs
            .Where(u => u.Id == indisponibilite.DirigeantId || u.Id == indisponibilite.AuteurId)
            .ToDictionaryAsync(u => u.Id);
        if (!personnes.TryGetValue(indisponibilite.DirigeantId, out var dirigeant))
        {
            return;
        }

        var agenda = configuration.AgendaDe(dirigeant.Email);
        var evenement = EvenementsAgenda.Indisponibilite(new IndisponibiliteAPublier(
            indisponibilite.Id,
            LibellesIndisponibilite.Type(indisponibilite.Type),
            indisponibilite.Motif,
            indisponibilite.Debut,
            indisponibilite.Fin,
            NomComplet(personnes.GetValueOrDefault(indisponibilite.AuteurId))));
        await calendrier.EnregistrerAsync(agenda, evenement);
        journal.LogInformation("[Sync Agenda] Indisponibilité {Id} publiée dans l'agenda {Agenda}", indisponibilite.Id, agenda);
    }

    public async Task SupprimerIndisponibiliteAsync(Guid indisponibiliteId, Guid dirigeantId)
    {
        if (!configuration.EstConfigure)
        {
            return;
        }

        var email = await contexte.Utilisateurs.Where(u => u.Id == dirigeantId).Select(u => u.Email).FirstOrDefaultAsync();
        if (email is null)
        {
            return;
        }

        var agenda = configuration.AgendaDe(email);
        await calendrier.SupprimerAsync(agenda, EvenementsAgenda.Identifiant(indisponibiliteId));
        journal.LogInformation("[Sync Agenda] Indisponibilité {Id} retirée de l'agenda {Agenda}", indisponibiliteId, agenda);
    }

    public async Task ResynchroniserToutAsync()
    {
        var depuis = DateTimeOffset.UtcNow.AddDays(-30);
        var demandes = await contexte.DemandesRencontre
            .Where(d => d.DateFinSouhaitee >= depuis)
            .Select(d => d.Id)
            .ToListAsync();
        var indisponibilites = await contexte.Indisponibilites
            .Where(i => i.Fin >= depuis)
            .Select(i => i.Id)
            .ToListAsync();
        var echecs = 0;
        foreach (var id in demandes)
        {
            echecs += await TenterAsync(id, () => SynchroniserDemandeAsync(id));
        }

        foreach (var id in indisponibilites)
        {
            echecs += await TenterAsync(id, () => SynchroniserIndisponibiliteAsync(id));
        }

        journal.LogInformation(
            "[Sync Agenda] Resynchronisation : {Demandes} demandes, {Indisponibilites} indisponibilités, {Echecs} échecs",
            demandes.Count,
            indisponibilites.Count,
            echecs);
    }

    private async Task<int> TenterAsync(Guid id, Func<Task> synchroniser)
    {
        try
        {
            await synchroniser();
            return 0;
        }
        catch (Exception exception)
        {
            journal.LogWarning(exception, "[Sync Agenda] Échec de la synchronisation de {Id}", id);
            return 1;
        }
    }

    private static (DateTimeOffset Debut, DateTimeOffset Fin, Guid? SalleId)? Rencontre(DemandeRencontre demande) =>
        demande switch
        {
            { RendezVous: { Statut: not StatutOccurrence.Annule } r } => (r.Debut, r.Fin, r.SalleId),
            { Reunion: { Statut: not StatutOccurrence.Annule } r } => (r.Debut, r.Fin, r.SalleId),
            _ => null,
        };

    private async Task<string> ParticipantsAsync(DemandeRencontre demande)
    {
        var identifiants = demande.Participants
            .Where(p => p.UtilisateurId.HasValue)
            .Select(p => p.UtilisateurId!.Value)
            .ToList();
        var internes = await contexte.Utilisateurs
            .Where(u => identifiants.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id);
        return string.Join(", ", demande.Participants.Select(p =>
            p.UtilisateurId is { } id && internes.TryGetValue(id, out var utilisateur) ? NomComplet(utilisateur) : p.NomComplet));
    }

    private async Task<string?> NomSalleAsync(Guid? salleId) =>
        salleId is null
            ? null
            : await contexte.Salles.Where(s => s.Id == salleId).Select(s => s.Nom).FirstOrDefaultAsync();

    private static string NomComplet(Utilisateur? utilisateur) =>
        utilisateur is null ? string.Empty : $"{utilisateur.Prenom} {utilisateur.Nom}".Trim();
}
