using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Notifications;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace GestionAgenda.Infrastructure.Services;

public sealed class NotificationsDemande(
    IDemandeRencontreRepository demandes,
    IAccesAgendaRepository acces,
    IUtilisateurRepository utilisateurs,
    INotificationRepository notifications,
    IUnitOfWork unitOfWork,
    IHubContext<NotificationsHub> hub,
    IEnfileurNotification enfileur,
    ILogger<NotificationsDemande> journal) : INotificationsDemande
{
    public Task DemandeCreeeAsync(Guid demandeId, CancellationToken cancellationToken = default) =>
        ProtegerAsync(() => PublierCreationAsync(demandeId, cancellationToken));

    public Task StatutModifieAsync(Guid demandeId, CancellationToken cancellationToken = default) =>
        ProtegerAsync(() => PublierStatutAsync(demandeId, cancellationToken));

    public Task RendezVousModifieAsync(Guid demandeId, CancellationToken cancellationToken = default) =>
        ProtegerAsync(() => PublierModificationAsync(demandeId, cancellationToken));

    public Task RappelerAsync(Guid demandeId, HorizonRappel horizon, CancellationToken cancellationToken = default) =>
        ProtegerAsync(() => PublierRappelAsync(demandeId, horizon, cancellationToken));

    private async Task PublierCreationAsync(Guid demandeId, CancellationToken cancellationToken)
    {
        var demande = await ChargerAsync(demandeId, cancellationToken);
        if (demande is null)
        {
            return;
        }

        var assistantesIds = await acces.ListerAssistantesActivesAsync(
            demande.DirigeantId, demande.SocieteId, cancellationToken);
        var assistantes = await PersonnesAsync(assistantesIds, cancellationToken);
        var dirigeant = await PersonneAsync(demande.DirigeantId, cancellationToken);
        if (dirigeant is null)
        {
            return;
        }

        await PublierAsync(
            demande,
            EvenementNotification.Creation,
            CiblageNotification.Creation(assistantes, dirigeant.Value),
            cancellationToken);
    }

    private async Task PublierStatutAsync(Guid demandeId, CancellationToken cancellationToken)
    {
        var demande = await ChargerAsync(demandeId, cancellationToken);
        if (demande is null)
        {
            return;
        }

        var evenement = TexteNotification.DepuisStatut(demande.Statut);
        if (evenement is null)
        {
            return;
        }

        var cibles = evenement == EvenementNotification.Annulation
            ? await CiblesAnnulationAsync(demande, cancellationToken)
            : evenement == EvenementNotification.Planifiee
                ? await CiblesParticipantsAsync(demande, cancellationToken)
                : await CiblesDemandeurAsync(demande, cancellationToken);
        await PublierAsync(demande, evenement.Value, cibles, cancellationToken);
    }

    private async Task PublierModificationAsync(Guid demandeId, CancellationToken cancellationToken)
    {
        var demande = await ChargerAsync(demandeId, cancellationToken);
        if (demande is null || demande.Statut is not (StatutDemande.Acceptee or StatutDemande.Planifiee))
        {
            return;
        }

        await PublierAsync(
            demande,
            EvenementNotification.ModificationRendezVous,
            await CiblesParticipantsAsync(demande, cancellationToken),
            cancellationToken);
    }

    private async Task PublierRappelAsync(
        Guid demandeId,
        HorizonRappel horizon,
        CancellationToken cancellationToken)
    {
        var demande = await ChargerAsync(demandeId, cancellationToken);
        if (demande is null || demande.Statut != StatutDemande.Planifiee)
        {
            return;
        }

        await PublierPrepareAsync(
            demande,
            EvenementNotification.Rappel,
            TexteNotification.TitreRappel(horizon),
            TexteNotification.MessageRappel(horizon, demande.Motif),
            await CiblesParticipantsAsync(demande, cancellationToken),
            cancellationToken);
    }

    private async Task<IReadOnlyList<DestinataireNotification>> CiblesDemandeurAsync(
        DemandeRencontre demande,
        CancellationToken cancellationToken)
    {
        var demandeur = await PersonneAsync(demande.DemandeurId, cancellationToken);
        return demandeur is null ? [] : CiblageNotification.Demandeur(demandeur.Value);
    }

    private async Task<IReadOnlyList<DestinataireNotification>> CiblesParticipantsAsync(
        DemandeRencontre demande,
        CancellationToken cancellationToken)
    {
        var dirigeant = await PersonneAsync(demande.DirigeantId, cancellationToken);
        var participants = await ParticipantsAsync(demande, cancellationToken);
        return dirigeant is null
            ? CiblageNotification.Distincts(participants)
            : CiblageNotification.Participants(dirigeant.Value, participants);
    }

    private async Task<IReadOnlyList<DestinataireNotification>> CiblesAnnulationAsync(
        DemandeRencontre demande,
        CancellationToken cancellationToken)
    {
        var demandeur = await PersonneAsync(demande.DemandeurId, cancellationToken);
        var dirigeant = await PersonneAsync(demande.DirigeantId, cancellationToken);
        if (demandeur is null || dirigeant is null)
        {
            return [];
        }

        var assistantes = await PersonnesAsync(
            await acces.ListerAssistantesActivesAsync(demande.DirigeantId, demande.SocieteId, cancellationToken),
            cancellationToken);
        return CiblageNotification.Annulation(
            demandeur.Value, dirigeant.Value, assistantes, await ParticipantsAsync(demande, cancellationToken));
    }

    private async Task PublierAsync(
        DemandeRencontre demande,
        EvenementNotification evenement,
        IReadOnlyList<DestinataireNotification> cibles,
        CancellationToken cancellationToken)
    {
        await PublierPrepareAsync(
            demande,
            evenement,
            TexteNotification.Titre(evenement),
            TexteNotification.Message(evenement, demande.Motif),
            cibles,
            cancellationToken);
    }

    private async Task PublierPrepareAsync(
        DemandeRencontre demande,
        EvenementNotification evenement,
        string titre,
        string message,
        IReadOnlyList<DestinataireNotification> cibles,
        CancellationToken cancellationToken)
    {
        var creees = new List<Notification>();
        foreach (var cible in cibles)
        {
            var notification = Notification.Creer(cible.UtilisateurId, cible.Email, titre, message, demande.Id, evenement);
            await notifications.AddAsync(notification, cancellationToken);
            creees.Add(notification);
        }

        if (creees.Count == 0)
        {
            return;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        foreach (var notification in creees)
        {
            await DiffuserImmediatAsync(notification, cancellationToken);
            enfileur.Enfiler(notification.Id);
        }
    }

    private async Task DiffuserImmediatAsync(Notification notification, CancellationToken cancellationToken)
    {
        if (notification.DestinataireId is null)
        {
            return;
        }

        var groupe = NotificationsHub.Groupe(notification.DestinataireId.Value);
        await hub.Clients.Group(groupe).SendAsync(
            "notification",
            new { notification.Titre, notification.Message, notification.DemandeId },
            cancellationToken);
    }

    private Task<DemandeRencontre?> ChargerAsync(Guid demandeId, CancellationToken cancellationToken) =>
        demandes.GetByIdAsync(demandeId, suivi: false, cancellationToken);

    private async Task<DestinataireNotification?> PersonneAsync(Guid utilisateurId, CancellationToken cancellationToken)
    {
        var utilisateur = await utilisateurs.GetByIdAsync(utilisateurId, cancellationToken);
        return utilisateur is null ? null : new DestinataireNotification(utilisateur.Id, utilisateur.Email);
    }

    private async Task<IReadOnlyList<DestinataireNotification>> PersonnesAsync(
        IReadOnlyList<Guid> identifiants,
        CancellationToken cancellationToken)
    {
        var trouves = await utilisateurs.GetByIdsAsync(identifiants, cancellationToken);
        return trouves.Select(utilisateur => new DestinataireNotification(utilisateur.Id, utilisateur.Email)).ToList();
    }

    private async Task<IReadOnlyList<DestinataireNotification>> ParticipantsAsync(
        DemandeRencontre demande,
        CancellationToken cancellationToken)
    {
        var internes = await PersonnesAsync(
            demande.Participants.Where(p => p.UtilisateurId.HasValue).Select(p => p.UtilisateurId!.Value).ToList(),
            cancellationToken);
        var externes = demande.Participants
            .Where(p => !string.IsNullOrWhiteSpace(p.Email))
            .Select(p => new DestinataireNotification(null, p.Email!));
        return internes.Concat(externes).ToList();
    }

    private async Task ProtegerAsync(Func<Task> action)
    {
        try
        {
            await action();
        }
        catch (Exception exception)
        {
            journal.LogError(exception, "La notification de demande n'a pas pu être préparée");
        }
    }
}
