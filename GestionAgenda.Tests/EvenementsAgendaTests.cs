using System.Text.RegularExpressions;
using FluentAssertions;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Infrastructure.Options;
using GestionAgenda.Infrastructure.Synchronisation;

namespace GestionAgenda.Tests;

public sealed class EvenementsAgendaTests
{
    private static readonly Guid DemandeId = Guid.Parse("9f1c2d3e-4b5a-6978-8a9b-0c1d2e3f4a5b");

    [Fact]
    public void Identifiant_RespecteLeFormatImposeParGoogle()
    {
        // Act
        var identifiant = EvenementsAgenda.Identifiant(DemandeId);

        // Assert
        identifiant.Should().Be("ga9f1c2d3e4b5a69788a9b0c1d2e3f4a5b");
        Regex.IsMatch(identifiant, "^[a-v0-9]{5,1024}$").Should().BeTrue();
    }

    [Fact]
    public void Rencontre_ReprendLeCreneauLaSalleEtLesPersonnes()
    {
        // Arrange
        var debut = new DateTimeOffset(2026, 10, 27, 10, 0, 0, TimeSpan.FromHours(3));

        // Act
        var evenement = EvenementsAgenda.Rencontre(Rencontre(TypeDemande.RendezVous, debut), "http://localhost:4200/");

        // Assert
        evenement.Id.Should().Be(EvenementsAgenda.Identifiant(DemandeId));
        evenement.Titre.Should().Be("[RDV] Point budget – Holding Démo");
        evenement.Debut.Should().Be(debut);
        evenement.Fin.Should().Be(debut.AddHours(1));
        evenement.Lieu.Should().Be("Salle Atlas");
        evenement.Couleur.Should().Be(CouleurEvenement.RendezVous);
        evenement.Prive.Should().BeFalse();
        evenement.Description.Should()
            .Contain("Demandeur : Louis Petit")
            .And.Contain("Participants : Alice Bernard")
            .And.Contain("Priorité : Haute")
            .And.Contain($"http://localhost:4200/demandes-rencontre/{DemandeId}");
    }

    [Fact]
    public void Rencontre_Reunion_SansUrl_NAjoutePasDeLien()
    {
        // Act
        var evenement = EvenementsAgenda.Rencontre(Rencontre(TypeDemande.Reunion, DateTimeOffset.UtcNow), string.Empty);

        // Assert
        evenement.Titre.Should().StartWith("[Réunion]");
        evenement.Couleur.Should().Be(CouleurEvenement.Reunion);
        evenement.Description.Should().NotContain("demandes-rencontre");
    }

    [Fact]
    public void Indisponibilite_EstPriveeEtBloqueLeCreneau()
    {
        // Arrange
        var id = Guid.NewGuid();
        var debut = new DateTimeOffset(2026, 10, 28, 8, 0, 0, TimeSpan.Zero);

        // Act
        var evenement = EvenementsAgenda.Indisponibilite(
            new IndisponibiliteAPublier(id, "Déplacement", "Salon Paris", debut, debut.AddHours(4), "Alice Bernard"));

        // Assert
        evenement.Id.Should().Be(EvenementsAgenda.Identifiant(id));
        evenement.Titre.Should().Be("Indisponible – Déplacement");
        evenement.Prive.Should().BeTrue();
        evenement.Couleur.Should().Be(CouleurEvenement.Indisponibilite);
        evenement.Description.Should().Contain("Salon Paris").And.Contain("Alice Bernard");
    }

    [Fact]
    public void AgendaDe_UtiliseLAgendaConfigureSinonLAgendaPrincipal()
    {
        // Arrange
        var options = new GoogleCalendarOptions();
        options.Agendas["claire.martin@demo.local"] = "agenda-direction@group.calendar.google.com";

        // Act & Assert
        options.AgendaDe("CLAIRE.MARTIN@demo.local").Should().Be("agenda-direction@group.calendar.google.com");
        options.AgendaDe("louis.petit@demo.local").Should().Be("louis.petit@demo.local");
    }

    private static RencontreAPublier Rencontre(TypeDemande type, DateTimeOffset debut) =>
        new(DemandeId, type, "Point budget", "Holding Démo", debut, debut.AddHours(1), "Salle Atlas", "Louis Petit", "Alice Bernard", Priorite.Haute);
}
