using FluentAssertions;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Tests;

public class WorkflowAssistanteTests
{
    [Fact]
    public void ParcoursRendezVous_AnalyseAcceptationPlanification_PasseATerminee()
    {
        // Arrange
        var assistante = Guid.CreateVersion7();
        var sut = DemandeRencontre.Creer(Demande(TypeDemande.RendezVous));

        // Act
        sut.PrendreEnAnalyse(assistante, null);
        sut.Accepter(assistante, null);
        sut.PlanifierRendezVous(CreneauRendezVous(sut), assistante, null);
        sut.Cloturer(assistante, null);

        // Assert
        sut.Statut.Should().Be(StatutDemande.Terminee);
        sut.RendezVous!.Statut.Should().Be(StatutOccurrence.Termine);
        sut.Historique.Select(h => h.TypeEvenement).Should().Equal(
            TypeEvenementDemande.Creation,
            TypeEvenementDemande.PriseEnAnalyse,
            TypeEvenementDemande.Acceptation,
            TypeEvenementDemande.Planification,
            TypeEvenementDemande.Cloture);
    }

    [Fact]
    public void ParcoursReunion_DepuisAcceptee_PlanifieLaReunion()
    {
        // Arrange
        var assistante = Guid.CreateVersion7();
        var participant = new NouveauParticipant(null, "Nina Leroy", "nina.leroy@demo.local");
        var sut = DemandeRencontre.Creer(Demande(TypeDemande.Reunion, [participant]));
        sut.PrendreEnAnalyse(assistante, null);
        sut.Accepter(assistante, null);

        // Act
        sut.PlanifierReunion(CreneauReunion(sut), assistante, null);

        // Assert
        sut.Statut.Should().Be(StatutDemande.Planifiee);
        sut.Reunion.Should().NotBeNull();
    }

    [Fact]
    public void EnAnalyse_TroisDecisions_AcceptationRefusOuReport()
    {
        // Arrange
        var refus = DemandeEnAnalyse();
        var report = DemandeEnAnalyse();
        var debut = DateTimeOffset.UtcNow.AddDays(3);

        // Act
        refus.Refuser(Guid.CreateVersion7(), "Créneau incompatible");
        report.Reporter(new ReportDemande(Guid.CreateVersion7(), "Décaler à la semaine suivante", debut, debut.AddHours(2)));

        // Assert
        refus.Statut.Should().Be(StatutDemande.Refusee);
        report.Statut.Should().Be(StatutDemande.Reportee);
        report.DateDebutSouhaitee.Should().Be(debut);
    }

    [Fact]
    public void Reportee_RepriseEnAnalyse_PermetEnsuiteLAcceptation()
    {
        // Arrange
        var assistante = Guid.CreateVersion7();
        var sut = DemandeEnAnalyse();
        var debut = DateTimeOffset.UtcNow.AddDays(4);
        sut.Reporter(new ReportDemande(assistante, "Reporter", debut, debut.AddHours(2)));

        // Act
        var accepterDirectement = () => sut.Accepter(assistante, null);
        accepterDirectement.Should().Throw<DomainException>();
        sut.PrendreEnAnalyse(assistante, null);
        sut.Accepter(assistante, null);

        // Assert
        sut.Statut.Should().Be(StatutDemande.Acceptee);
    }

    [Fact]
    public void Acceptee_RefuseOuReport_ThrowsDomainException()
    {
        // Arrange
        var sut = DemandeAcceptee();

        // Act
        var refuser = () => sut.Refuser(Guid.CreateVersion7(), "Non");
        var reporter = () => sut.Reporter(new ReportDemande(
            Guid.CreateVersion7(), "Plus tard", DateTimeOffset.UtcNow.AddDays(2), DateTimeOffset.UtcNow.AddDays(2).AddHours(2)));

        // Assert
        refuser.Should().Throw<DomainException>();
        reporter.Should().Throw<DomainException>();
        sut.Statut.Should().Be(StatutDemande.Acceptee);
    }

    [Fact]
    public void Planifiee_TerminerSansCloture_ThrowsDomainException()
    {
        // Arrange
        var sut = DemandePlanifiee();

        // Act
        var reporter = () => sut.Reporter(new ReportDemande(
            Guid.CreateVersion7(), "Décaler", DateTimeOffset.UtcNow.AddDays(5), DateTimeOffset.UtcNow.AddDays(5).AddHours(2)));

        // Assert
        reporter.Should().Throw<DomainException>();
        sut.Statut.Should().Be(StatutDemande.Planifiee);
    }

    private static DemandeRencontre DemandeEnAnalyse()
    {
        var demande = DemandeRencontre.Creer(Demande(TypeDemande.RendezVous));
        demande.PrendreEnAnalyse(Guid.CreateVersion7(), null);
        return demande;
    }

    private static DemandeRencontre DemandeAcceptee()
    {
        var demande = DemandeEnAnalyse();
        demande.Accepter(Guid.CreateVersion7(), null);
        return demande;
    }

    private static DemandeRencontre DemandePlanifiee()
    {
        var demande = DemandeAcceptee();
        demande.PlanifierRendezVous(CreneauRendezVous(demande), Guid.CreateVersion7(), null);
        return demande;
    }

    private static RendezVous CreneauRendezVous(DemandeRencontre demande) =>
        RendezVous.Planifier(new CreneauPlanifie(
            demande.DirigeantId,
            demande.SocieteId,
            demande.Id,
            null,
            demande.DateDebutSouhaitee,
            demande.DateDebutSouhaitee.AddMinutes(demande.DureeMinutes),
            demande.Motif));

    private static Reunion CreneauReunion(DemandeRencontre demande) =>
        Reunion.Planifier(new CreneauPlanifie(
            demande.DirigeantId,
            demande.SocieteId,
            demande.Id,
            null,
            demande.DateDebutSouhaitee,
            demande.DateDebutSouhaitee.AddMinutes(demande.DureeMinutes),
            demande.Motif));

    private static NouvelleDemande Demande(TypeDemande type, IReadOnlyList<NouveauParticipant>? participants = null)
    {
        var debut = DateTimeOffset.UtcNow.AddDays(1);
        return new NouvelleDemande(
            Guid.CreateVersion7(),
            Guid.CreateVersion7(),
            Guid.CreateVersion7(),
            type,
            "Point budget trimestriel",
            debut,
            debut.AddHours(2),
            60,
            Urgence.Urgent,
            Priorite.Haute,
            null,
            participants ?? []);
    }
}
