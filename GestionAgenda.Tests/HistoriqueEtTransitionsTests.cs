using FluentAssertions;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Tests;

public class HistoriqueEtTransitionsTests
{
    [Fact]
    public void ChangerUrgence_EnregistreLEvenement()
    {
        // Arrange
        var sut = DemandeEnAnalyse();

        // Act
        sut.ChangerUrgence(Urgence.Critique, Guid.CreateVersion7(), "Délai court");

        // Assert
        sut.Urgence.Should().Be(Urgence.Critique);
        sut.Historique.Should().Contain(h =>
            h.TypeEvenement == TypeEvenementDemande.ChangementUrgence && h.Commentaire == "Délai court");
    }

    [Fact]
    public void ChangerPriorite_EnregistreLEvenement()
    {
        // Arrange
        var sut = DemandeEnAnalyse();

        // Act
        sut.ChangerPriorite(Priorite.Critique, Guid.CreateVersion7(), "Arbitrage");

        // Assert
        sut.Priorite.Should().Be(Priorite.Critique);
        sut.Historique.Should().Contain(h => h.TypeEvenement == TypeEvenementDemande.ChangementPriorite);
    }

    [Fact]
    public void Refuser_EnregistreLeCommentaire()
    {
        // Arrange
        var sut = DemandeEnAnalyse();

        // Act
        sut.Refuser(Guid.CreateVersion7(), "Créneau incompatible");

        // Assert
        sut.Statut.Should().Be(StatutDemande.Refusee);
        sut.Historique.Should().Contain(h =>
            h.TypeEvenement == TypeEvenementDemande.Refus && h.Commentaire == "Créneau incompatible");
    }

    [Fact]
    public void Reporter_EnregistreLesNouvellesDates()
    {
        // Arrange
        var sut = DemandeEnAnalyse();
        var debut = DateTimeOffset.UtcNow.AddDays(4);

        // Act
        sut.Reporter(new ReportDemande(Guid.CreateVersion7(), "Semaine suivante", debut, debut.AddHours(2)));

        // Assert
        sut.Statut.Should().Be(StatutDemande.Reportee);
        sut.Historique.Should().Contain(h =>
            h.TypeEvenement == TypeEvenementDemande.Report && h.DateDebutApres == debut);
    }

    [Fact]
    public void Refuser_DepuisEnAttente_PasseARefusee()
    {
        // Arrange
        var sut = DemandeRencontre.Creer(Nouvelle());

        // Act
        sut.Refuser(Guid.CreateVersion7(), "Trop tôt");

        // Assert
        sut.Statut.Should().Be(StatutDemande.Refusee);
        sut.Historique.Should().Contain(h => h.StatutApres == StatutDemande.Refusee && h.Commentaire == "Trop tôt");
    }

    [Fact]
    public void Planifier_DepuisEnAnalyse_ThrowsDomainException()
    {
        // Arrange
        var sut = DemandeEnAnalyse();

        // Act
        var act = () => sut.PlanifierRendezVous(Creneau(sut), Guid.CreateVersion7(), null);

        // Assert
        act.Should().Throw<DomainException>();
        sut.Statut.Should().Be(StatutDemande.EnAnalyse);
        sut.RendezVous.Should().BeNull();
    }

    [Fact]
    public void Acces_Etranger_NePeutPasVoir()
    {
        // Act
        var peutVoir = AccesDemande.PeutVoir(estDemandeur: false, estDirigeant: false, estAssistanteActive: false);

        // Assert
        peutVoir.Should().BeFalse();
    }

    private static DemandeRencontre DemandeEnAnalyse()
    {
        var demande = DemandeRencontre.Creer(Nouvelle());
        demande.PrendreEnAnalyse(Guid.CreateVersion7(), null);
        return demande;
    }

    private static RendezVous Creneau(DemandeRencontre demande) =>
        RendezVous.Planifier(new CreneauPlanifie(
            demande.DirigeantId,
            demande.SocieteId,
            demande.Id,
            null,
            demande.DateDebutSouhaitee,
            demande.DateDebutSouhaitee.AddMinutes(demande.DureeMinutes),
            demande.Motif));

    private static NouvelleDemande Nouvelle()
    {
        var debut = DateTimeOffset.UtcNow.AddDays(2);
        return new NouvelleDemande(
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
            []);
    }
}
