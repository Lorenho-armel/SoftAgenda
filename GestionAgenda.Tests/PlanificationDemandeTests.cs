using FluentAssertions;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Services;
using Moq;

namespace GestionAgenda.Tests;

public class PlanificationDemandeTests
{
    [Fact]
    public async Task Appliquer_CreneauLibre_CreeLeRendezVousLieALaDemande()
    {
        // Arrange
        var planification = new Mock<IPlanificationRepository>();
        Libre(planification);
        var sut = new PlanificationDemande(planification.Object);
        var demande = DemandeAcceptee();
        var participants = demande.Participants.Count;

        // Act
        await sut.AppliquerAsync(demande, StatutPlanifie(demande.DateDebutSouhaitee, null), Guid.CreateVersion7());

        // Assert
        demande.Statut.Should().Be(StatutDemande.Planifiee);
        demande.RendezVous!.DemandeRencontreId.Should().Be(demande.Id);
        demande.Reunion.Should().BeNull();
        demande.Participants.Should().HaveCount(participants);
    }

    [Fact]
    public async Task Appliquer_ConflitsDirigeantEtSalle_NInscritPasLeCreneau()
    {
        // Arrange
        var demande = DemandeAcceptee();
        var salle = Salle.Creer(demande.SocieteId, "Conseil", 8);
        var debut = demande.DateDebutSouhaitee;
        var planification = new Mock<IPlanificationRepository>();
        Libre(planification);
        planification.Setup(p => p.GetSalleAsync(salle.Id, It.IsAny<CancellationToken>())).ReturnsAsync(salle);
        planification.Setup(p => p.OccupationsDirigeantAsync(
                demande.DirigeantId, It.IsAny<Intervalle>(), demande.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync([Occupation(debut)]);
        planification.Setup(p => p.OccupationsSalleAsync(
                salle.Id, It.IsAny<Intervalle>(), demande.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync([new OccupationSalle(Guid.CreateVersion7(), "Autre comité", debut, debut.AddMinutes(30))]);
        var sut = new PlanificationDemande(planification.Object);

        // Act
        var act = () => sut.AppliquerAsync(demande, StatutPlanifie(debut, salle.Id), Guid.CreateVersion7());

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Conflits.Select(c => c.Nature).Should().Equal(
            TypeConflit.CalendrierDirigeant, TypeConflit.Salle);
        exception.Which.Conflits.Should().OnlyContain(c => c.Bloquant);
        demande.Statut.Should().Be(StatutDemande.Acceptee);
        demande.RendezVous.Should().BeNull();
    }

    [Fact]
    public async Task Appliquer_ParticipantInterneOccupe_ResteAcceptee()
    {
        // Arrange
        var participantId = Guid.CreateVersion7();
        var demande = DemandeAcceptee(participantId);
        var debut = demande.DateDebutSouhaitee;
        var planification = new Mock<IPlanificationRepository>();
        Libre(planification);
        planification.Setup(p => p.OccupationsParticipantsAsync(
                It.Is<IReadOnlyCollection<Guid>>(ids => ids.Contains(participantId)),
                It.IsAny<Intervalle>(),
                demande.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync([Occupation(debut) with { PersonneId = participantId, PersonneNom = "Louis Petit" }]);
        var sut = new PlanificationDemande(planification.Object);

        // Act
        var act = () => sut.AppliquerAsync(demande, StatutPlanifie(debut, null), Guid.CreateVersion7());

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Conflits.Should().ContainSingle(c => c.Nature == TypeConflit.CalendrierParticipant);
        demande.Statut.Should().Be(StatutDemande.Acceptee);
    }

    [Fact]
    public async Task Deplacer_CreneauLibre_MetAJourLeRendezVous()
    {
        // Arrange
        var planification = new Mock<IPlanificationRepository>();
        Libre(planification);
        var sut = new PlanificationDemande(planification.Object);
        var demande = DemandeAcceptee();
        var debut = demande.DateDebutSouhaitee;
        await sut.AppliquerAsync(demande, StatutPlanifie(debut, null), Guid.CreateVersion7());
        var nouveauDebut = debut.AddMinutes(30);

        // Act
        await sut.DeplacerAsync(demande, nouveauDebut, null, Guid.CreateVersion7());

        // Assert
        demande.Statut.Should().Be(StatutDemande.Planifiee);
        demande.RendezVous!.Debut.Should().Be(nouveauDebut);
        demande.Historique.Should().Contain(h => h.TypeEvenement == TypeEvenementDemande.Deplacement);
    }

    [Fact]
    public async Task Deplacer_ConflitSalle_LaisseLeCreneauInchange()
    {
        // Arrange
        var demande = DemandeAcceptee();
        var salle = Salle.Creer(demande.SocieteId, "Conseil", 8);
        var debut = demande.DateDebutSouhaitee;
        var planification = new Mock<IPlanificationRepository>();
        Libre(planification);
        planification.Setup(p => p.GetSalleAsync(salle.Id, It.IsAny<CancellationToken>())).ReturnsAsync(salle);
        var sut = new PlanificationDemande(planification.Object);
        await sut.AppliquerAsync(demande, StatutPlanifie(debut, salle.Id), Guid.CreateVersion7());
        planification.Setup(p => p.OccupationsSalleAsync(
                salle.Id, It.IsAny<Intervalle>(), demande.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync([new OccupationSalle(Guid.CreateVersion7(), "Autre", debut, debut.AddMinutes(30))]);

        // Act
        var act = () => sut.DeplacerAsync(demande, debut.AddMinutes(15), salle.Id, Guid.CreateVersion7());

        // Assert
        await act.Should().ThrowAsync<ConflictException>();
        demande.RendezVous!.Debut.Should().Be(debut);
    }

    [Fact]
    public async Task Evaluer_SalleTropPetite_ThrowsDomainException()
    {
        // Arrange
        var demande = DemandeAcceptee(Guid.CreateVersion7());
        var salle = Salle.Creer(demande.SocieteId, "Bureau", 1);
        var planification = new Mock<IPlanificationRepository>();
        planification.Setup(p => p.GetSalleAsync(salle.Id, It.IsAny<CancellationToken>())).ReturnsAsync(salle);
        var sut = new PlanificationDemande(planification.Object);

        // Act
        var act = () => sut.EvaluerAsync(demande, demande.DateDebutSouhaitee, salle.Id, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<DomainException>();
    }

    [Fact]
    public async Task Appliquer_AgendaGoogleOccupe_BloqueLaPlanification()
    {
        // Arrange
        var demande = DemandeAcceptee();
        var debut = demande.DateDebutSouhaitee;
        var planification = new Mock<IPlanificationRepository>();
        Libre(planification);
        var disponibilites = new Mock<IDisponibilitesExternes>();
        disponibilites.Setup(d => d.OccupationsDirigeantAsync(demande.DirigeantId, It.IsAny<Intervalle>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DisponibilitesExternes(true, null, [new CreneauOccupeExterne("Dentiste", debut, debut.AddMinutes(30))]));
        var sut = new PlanificationDemande(planification.Object, disponibilites.Object);

        // Act
        var act = () => sut.AppliquerAsync(demande, StatutPlanifie(debut, null), Guid.CreateVersion7());

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Conflits.Should().ContainSingle(c =>
            c.Nature == TypeConflit.AgendaGoogle && c.Bloquant && c.Message.Contains("Dentiste"));
        demande.Statut.Should().Be(StatutDemande.Acceptee);
    }

    [Fact]
    public async Task Appliquer_AgendaGoogleInjoignable_PlanifieAvecUnAvertissement()
    {
        // Arrange
        var demande = DemandeAcceptee();
        var planification = new Mock<IPlanificationRepository>();
        Libre(planification);
        var disponibilites = new Mock<IDisponibilitesExternes>();
        disponibilites.Setup(d => d.OccupationsDirigeantAsync(It.IsAny<Guid>(), It.IsAny<Intervalle>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(DisponibilitesExternes.NonVerifiees("Google est injoignable."));
        var sut = new PlanificationDemande(planification.Object, disponibilites.Object);

        // Act
        var bilan = await sut.EvaluerAsync(demande, demande.DateDebutSouhaitee, null, CancellationToken.None);
        await sut.AppliquerAsync(demande, StatutPlanifie(demande.DateDebutSouhaitee, null), Guid.CreateVersion7());

        // Assert
        bilan.PeutPlanifier.Should().BeTrue();
        bilan.Conflits.Should().ContainSingle(c => c.Nature == TypeConflit.AgendaGoogleNonVerifie && !c.Bloquant);
        demande.Statut.Should().Be(StatutDemande.Planifiee);
    }

    private static void Libre(Mock<IPlanificationRepository> planification)
    {
        planification.Setup(p => p.OccupationsDirigeantAsync(
                It.IsAny<Guid>(), It.IsAny<Intervalle>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        planification.Setup(p => p.OccupationsParticipantsAsync(
                It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<Intervalle>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        planification.Setup(p => p.OccupationsSalleAsync(
                It.IsAny<Guid>(), It.IsAny<Intervalle>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
    }

    private static OccupationCalendrier Occupation(DateTimeOffset debut) =>
        new(Guid.CreateVersion7(), Guid.CreateVersion7(), "Claire Martin", "Comité", debut, debut.AddMinutes(45));

    private static ChangerStatutDemandeRequest StatutPlanifie(DateTimeOffset debut, Guid? salleId) =>
        new(StatutDemande.Planifiee, null, null, null, debut, salleId);

    private static DemandeRencontre DemandeAcceptee(Guid? participantId = null)
    {
        var debut = DateTimeOffset.UtcNow.AddDays(2);
        var participants = participantId is null
            ? Array.Empty<NouveauParticipant>()
            : new[] { new NouveauParticipant(participantId, null, null) };
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
            participants));
        demande.PrendreEnAnalyse(Guid.CreateVersion7(), null);
        demande.Accepter(Guid.CreateVersion7(), null);
        return demande;
    }
}
