using FluentAssertions;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;
using Moq;
using static GestionAgenda.Tests.ReglesDemandeFixture;

namespace GestionAgenda.Tests;

public class DemandeRencontreReglesServiceTests
{
    [Fact]
    public async Task CreateAsync_MotifTropCourt_ThrowsDomainException()
    {
        // Arrange
        var sut = Service();
        var request = Creation() with { Motif = "ab" };

        // Act
        var act = () => sut.CreateAsync(request, Guid.CreateVersion7(), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<DomainException>();
    }

    [Fact]
    public async Task CreateAsync_ParticipantHorsSociete_ThrowsDomainException()
    {
        // Arrange
        var acces = AccesCreation();
        acces.Setup(a => a.SontMembresAsync(It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        var sut = Service(acces: acces);
        var request = Creation() with { Participants = [new ParticipantRequest(Guid.CreateVersion7(), null, null)] };

        // Act
        var act = () => sut.CreateAsync(request, Guid.CreateVersion7(), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<DomainException>();
    }

    [Fact]
    public async Task CreateAsync_SalleHorsSociete_ThrowsDomainException()
    {
        // Arrange
        var salle = Salle.Creer(Guid.CreateVersion7(), "Conseil", 8);
        var planification = new Mock<IPlanificationRepository>();
        planification.Setup(p => p.GetSalleAsync(salle.Id, It.IsAny<CancellationToken>())).ReturnsAsync(salle);
        var sut = Service(acces: AccesCreation(), planification: planification);
        var request = Creation() with { SalleSouhaiteeId = salle.Id };

        // Act
        var act = () => sut.CreateAsync(request, Guid.CreateVersion7(), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<DomainException>();
    }

    [Fact]
    public async Task GetByIdAsync_EtrangerALaSociete_ThrowsNotFound()
    {
        // Arrange
        var demande = Demande(StatutDemande.EnAnalyse);
        var sut = Service(Depot(demande));

        // Act
        var act = () => sut.GetByIdAsync(demande.Id, Guid.CreateVersion7(), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task ChangerStatutAsync_DirigeantAvecAssistante_ThrowsForbidden()
    {
        // Arrange
        var demande = Demande(StatutDemande.EnAnalyse);
        var acces = new Mock<IAccesAgendaRepository>();
        acces.Setup(a => a.EstDirigeantAsync(demande.DirigeantId, demande.SocieteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        acces.Setup(a => a.AAssistanteActiveAsync(demande.DirigeantId, demande.SocieteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        var sut = Service(Depot(demande), acces);

        // Act
        var act = () => sut.ChangerStatutAsync(demande.Id, Statut(StatutDemande.Acceptee), demande.DirigeantId, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ForbiddenException>();
        demande.Statut.Should().Be(StatutDemande.EnAnalyse);
    }

    [Fact]
    public async Task ChangerUrgenceAsync_Assistante_MetAJourEtHistorise()
    {
        // Arrange
        var demande = Demande(StatutDemande.EnAnalyse);
        var assistante = Guid.CreateVersion7();
        var sut = Service(Depot(demande), Assistante(assistante, demande));

        // Act
        var resultat = await sut.ChangerUrgenceAsync(
            demande.Id, new ChangerUrgenceDemandeRequest(Urgence.Critique, null), assistante, CancellationToken.None);

        // Assert
        resultat.Urgence.Should().Be(Urgence.Critique);
        resultat.Historique.Should().Contain(h => h.TypeEvenement == TypeEvenementDemande.ChangementUrgence);
    }

    [Fact]
    public async Task ChangerPrioriteAsync_Assistante_MetAJourEtHistorise()
    {
        // Arrange
        var demande = Demande(StatutDemande.EnAnalyse);
        var assistante = Guid.CreateVersion7();
        var sut = Service(Depot(demande), Assistante(assistante, demande));

        // Act
        var resultat = await sut.ChangerPrioriteAsync(
            demande.Id, new ChangerPrioriteDemandeRequest(Priorite.Critique, null), assistante, CancellationToken.None);

        // Assert
        resultat.Priorite.Should().Be(Priorite.Critique);
        resultat.Historique.Should().Contain(h => h.TypeEvenement == TypeEvenementDemande.ChangementPriorite);
    }

    [Fact]
    public async Task ChangerStatutAsync_Acceptation_PasseAAcceptee()
    {
        // Arrange
        var contexte = ContexteAssistante(StatutDemande.EnAnalyse);

        // Act
        var resultat = await contexte.Service.ChangerStatutAsync(
            contexte.Demande.Id, Statut(StatutDemande.Acceptee), contexte.AssistanteId, CancellationToken.None);

        // Assert
        resultat.Statut.Should().Be(StatutDemande.Acceptee);
        resultat.Historique.Should().Contain(h => h.TypeEvenement == TypeEvenementDemande.Acceptation);
    }

    [Fact]
    public async Task ChangerStatutAsync_Refus_PasseARefusee()
    {
        // Arrange
        var contexte = ContexteAssistante(StatutDemande.EnAnalyse);

        // Act
        var resultat = await contexte.Service.ChangerStatutAsync(
            contexte.Demande.Id,
            Statut(StatutDemande.Refusee, "Créneau incompatible"),
            contexte.AssistanteId,
            CancellationToken.None);

        // Assert
        resultat.Statut.Should().Be(StatutDemande.Refusee);
        resultat.Historique.Should().Contain(h => h.TypeEvenement == TypeEvenementDemande.Refus);
    }

    [Fact]
    public async Task ChangerStatutAsync_Report_PasseAReportee()
    {
        // Arrange
        var contexte = ContexteAssistante(StatutDemande.EnAnalyse);
        var debut = DateTimeOffset.UtcNow.AddDays(5);

        // Act
        var resultat = await contexte.Service.ChangerStatutAsync(
            contexte.Demande.Id,
            new ChangerStatutDemandeRequest(StatutDemande.Reportee, "Semaine suivante", debut, debut.AddHours(2), null, null),
            contexte.AssistanteId,
            CancellationToken.None);

        // Assert
        resultat.Statut.Should().Be(StatutDemande.Reportee);
        resultat.DateDebutSouhaitee.Should().Be(debut);
        resultat.Historique.Should().Contain(h => h.TypeEvenement == TypeEvenementDemande.Report);
    }

    [Fact]
    public async Task ChangerStatutAsync_AcceptationDepuisEnAttente_PasseAAcceptee()
    {
        // Arrange
        var contexte = ContexteAssistante(StatutDemande.EnAttente);

        // Act
        await contexte.Service.ChangerStatutAsync(
            contexte.Demande.Id, Statut(StatutDemande.Acceptee), contexte.AssistanteId, CancellationToken.None);

        // Assert
        contexte.Demande.Statut.Should().Be(StatutDemande.Acceptee);
    }

    [Fact]
    public async Task ChangerStatutAsync_CreneauDirigeantOccupe_BloqueLaPlanification()
    {
        // Arrange
        var contexte = ContexteAssistante(StatutDemande.Acceptee);
        var debut = contexte.Demande.DateDebutSouhaitee;
        contexte.Planification.Setup(p => p.OccupationsDirigeantAsync(
                contexte.Demande.DirigeantId, It.IsAny<Intervalle>(), contexte.Demande.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync([new OccupationCalendrier(Guid.CreateVersion7(), contexte.Demande.DirigeantId, "Claire Martin", "Comité", debut, debut.AddMinutes(45))]);

        // Act
        var act = () => contexte.Service.ChangerStatutAsync(
            contexte.Demande.Id, Planifie(debut, null), contexte.AssistanteId, CancellationToken.None);

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Conflits.Should().ContainSingle(c => c.Nature == TypeConflit.CalendrierDirigeant && c.Bloquant);
        contexte.Demande.Statut.Should().Be(StatutDemande.Acceptee);
    }

    [Fact]
    public async Task ChangerStatutAsync_SalleOccupee_BloqueLaPlanification()
    {
        // Arrange
        var contexte = ContexteAssistante(StatutDemande.Acceptee);
        var debut = contexte.Demande.DateDebutSouhaitee;
        var salle = Salle.Creer(contexte.Demande.SocieteId, "Conseil", 8);
        contexte.Planification.Setup(p => p.GetSalleAsync(salle.Id, It.IsAny<CancellationToken>())).ReturnsAsync(salle);
        contexte.Planification.Setup(p => p.OccupationsSalleAsync(
                salle.Id, It.IsAny<Intervalle>(), contexte.Demande.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync([new OccupationSalle(Guid.CreateVersion7(), "Autre comité", debut, debut.AddMinutes(30))]);

        // Act
        var act = () => contexte.Service.ChangerStatutAsync(
            contexte.Demande.Id, Planifie(debut, salle.Id), contexte.AssistanteId, CancellationToken.None);

        // Assert
        var exception = await act.Should().ThrowAsync<ConflictException>();
        exception.Which.Conflits.Should().ContainSingle(c => c.Nature == TypeConflit.Salle && c.Bloquant);
        contexte.Demande.RendezVous.Should().BeNull();
    }

    [Fact]
    public async Task ChangerStatutAsync_CreneauLibre_PlanifieLeRendezVous()
    {
        // Arrange
        var contexte = ContexteAssistante(StatutDemande.Acceptee);
        var debut = contexte.Demande.DateDebutSouhaitee;

        // Act
        var resultat = await contexte.Service.ChangerStatutAsync(
            contexte.Demande.Id, Planifie(debut, null), contexte.AssistanteId, CancellationToken.None);

        // Assert
        resultat.Statut.Should().Be(StatutDemande.Planifiee);
        resultat.RendezVousId.Should().NotBeNull();
        resultat.Historique.Should().Contain(h => h.TypeEvenement == TypeEvenementDemande.Planification);
    }
}
