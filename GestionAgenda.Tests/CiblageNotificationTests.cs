using FluentAssertions;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Tests;

public class CiblageNotificationTests
{
    private static readonly DestinataireNotification Demandeur = new(Guid.NewGuid(), "demandeur@demo.local");
    private static readonly DestinataireNotification Dirigeant = new(Guid.NewGuid(), "dirigeant@demo.local");
    private static readonly DestinataireNotification Assistante = new(Guid.NewGuid(), "assistante@demo.local");

    [Fact]
    public void Creation_AvecAssistante_NeNotifiePasLeDirigeant()
    {
        // Arrange
        var assistantes = new List<DestinataireNotification> { Assistante };

        // Act
        var cibles = CiblageNotification.Creation(assistantes, Dirigeant);

        // Assert
        cibles.Should().ContainSingle().Which.Email.Should().Be(Assistante.Email);
    }

    [Fact]
    public void Creation_SansAssistante_NotifieLeDirigeant()
    {
        // Arrange
        var assistantes = Array.Empty<DestinataireNotification>();

        // Act
        var cibles = CiblageNotification.Creation(assistantes, Dirigeant);

        // Assert
        cibles.Should().ContainSingle().Which.Email.Should().Be(Dirigeant.Email);
    }

    [Fact]
    public void Annulation_DedoublonneLesEmails()
    {
        // Arrange
        var participants = new List<DestinataireNotification> { Dirigeant, Demandeur };

        // Act
        var cibles = CiblageNotification.Annulation(Demandeur, Dirigeant, [Assistante], participants);

        // Assert
        cibles.Select(cible => cible.Email).Should().BeEquivalentTo(
            Demandeur.Email, Dirigeant.Email, Assistante.Email);
    }

    [Fact]
    public void DepuisStatut_Acceptee_CibleLeDemandeur()
    {
        // Act
        var evenement = TexteNotification.DepuisStatut(StatutDemande.Acceptee);

        // Assert
        evenement.Should().Be(EvenementNotification.Acceptee);
        TexteNotification.Titre(evenement!.Value).Should().Be("Demande acceptée");
    }
}
