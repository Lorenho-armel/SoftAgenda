using AutoMapper;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Application.Mappings;
using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Application.Validators;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace GestionAgenda.Tests;

internal static class ReglesDemandeFixture
{
    internal static ContexteAssistante ContexteAssistante(StatutDemande statut)
    {
        var demande = Demande(statut);
        var assistante = Guid.CreateVersion7();
        var planification = CalendrierLibre();
        var service = Service(Depot(demande), Assistante(assistante, demande), planification);
        return new ContexteAssistante(service, demande, assistante, planification);
    }

    internal static Mock<IAccesAgendaRepository> Assistante(Guid assistanteId, DemandeRencontre demande)
    {
        var acces = new Mock<IAccesAgendaRepository>();
        acces.Setup(a => a.EstAssistanteActiveAsync(
                assistanteId, demande.DirigeantId, demande.SocieteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        return acces;
    }

    internal static Mock<IAccesAgendaRepository> AccesCreation()
    {
        var acces = new Mock<IAccesAgendaRepository>();
        acces.Setup(a => a.EstMembreAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(true);
        acces.Setup(a => a.EstDirigeantAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(true);
        acces.Setup(a => a.SontMembresAsync(
                It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        return acces;
    }

    internal static Mock<IDemandeRencontreRepository> Depot(DemandeRencontre demande)
    {
        var demandes = new Mock<IDemandeRencontreRepository>();
        demandes.Setup(d => d.GetByIdAsync(demande.Id, It.IsAny<bool>(), It.IsAny<CancellationToken>())).ReturnsAsync(demande);
        return demandes;
    }

    internal static ChangerStatutDemandeRequest Statut(StatutDemande statut, string? commentaire = null) =>
        new(statut, commentaire, null, null, null, null);

    internal static ChangerStatutDemandeRequest Planifie(DateTimeOffset debut, Guid? salleId) =>
        new(StatutDemande.Planifiee, null, null, null, debut, salleId);

    internal static CreerDemandeRencontreRequest Creation()
    {
        var debut = DateTimeOffset.UtcNow.AddDays(2);
        return new CreerDemandeRencontreRequest(
            Guid.CreateVersion7(),
            Guid.CreateVersion7(),
            TypeDemande.RendezVous,
            "Point budget trimestriel",
            debut,
            debut.AddHours(2),
            60,
            Urgence.Normal,
            Priorite.Moyenne,
            null,
            []);
    }

    internal static DemandeRencontre Demande(StatutDemande statut)
    {
        var debut = DateTimeOffset.UtcNow.AddDays(2);
        var demande = DemandeRencontre.Creer(new NouvelleDemande(
            Guid.CreateVersion7(),
            Guid.CreateVersion7(),
            Guid.CreateVersion7(),
            TypeDemande.RendezVous,
            "Point budget trimestriel",
            debut,
            debut.AddHours(2),
            60,
            Urgence.Normal,
            Priorite.Moyenne,
            null,
            []));
        if (statut == StatutDemande.EnAttente)
        {
            return demande;
        }

        demande.PrendreEnAnalyse(Guid.CreateVersion7(), null);
        if (statut == StatutDemande.Acceptee)
        {
            demande.Accepter(Guid.CreateVersion7(), null);
        }

        return demande;
    }

    internal static DemandeRencontreService Service(
        Mock<IDemandeRencontreRepository>? demandes = null,
        Mock<IAccesAgendaRepository>? acces = null,
        Mock<IPlanificationRepository>? planification = null)
    {
        var depotPlanification = planification ?? CalendrierLibre();
        var notifications = new Mock<INotificationsDemande>();
        notifications.SetReturnsDefault(Task.CompletedTask);
        var mapper = new MapperConfiguration(cfg => cfg.AddProfile<DemandeRencontreProfile>()).CreateMapper();
        return new DemandeRencontreService(
            (demandes ?? new Mock<IDemandeRencontreRepository>()).Object,
            (acces ?? new Mock<IAccesAgendaRepository>()).Object,
            depotPlanification.Object,
            new Mock<IUtilisateurRepository>().Object,
            new PlanificationDemande(depotPlanification.Object),
            new Mock<IUnitOfWork>().Object,
            new CreerDemandeRencontreRequestValidator(),
            new MettreAJourDemandeRencontreRequestValidator(),
            new ChangerStatutDemandeRequestValidator(),
            new ChangerPrioriteDemandeRequestValidator(),
            new ChangerUrgenceDemandeRequestValidator(),
            new DemandeRencontreQueryValidator(),
            new VerifierCreneauRequestValidator(),
            mapper,
            notifications.Object,
            NullLogger<DemandeRencontreService>.Instance);
    }

    private static Mock<IPlanificationRepository> CalendrierLibre()
    {
        var planification = new Mock<IPlanificationRepository>();
        planification.Setup(p => p.OccupationsDirigeantAsync(
                It.IsAny<Guid>(), It.IsAny<Intervalle>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        planification.Setup(p => p.OccupationsParticipantsAsync(
                It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<Intervalle>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        planification.Setup(p => p.OccupationsSalleAsync(
                It.IsAny<Guid>(), It.IsAny<Intervalle>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        return planification;
    }
}

internal sealed record ContexteAssistante(
    DemandeRencontreService Service,
    DemandeRencontre Demande,
    Guid AssistanteId,
    Mock<IPlanificationRepository> Planification);
