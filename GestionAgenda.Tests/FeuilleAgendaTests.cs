using FluentAssertions;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Infrastructure.Synchronisation;

namespace GestionAgenda.Tests;

public sealed class FeuilleAgendaTests
{
    [Fact]
    public void LireDate_NumeroDeSerieEtTexte_DonnentLaMemeDate()
    {
        // Act
        var serie = FeuilleAgenda.LireDate(46290d);
        var texte = FeuilleAgenda.LireDate("25/09/2026");

        // Assert
        serie.Should().Be(new DateOnly(2026, 9, 25));
        texte.Should().Be(new DateOnly(2026, 9, 25));
    }

    [Theory]
    [InlineData("14h30", 14, 30)]
    [InlineData("9:05", 9, 5)]
    [InlineData("10h", 10, 0)]
    public void LireHeure_FormatsSaisis_SontReconnus(string saisie, int heures, int minutes)
    {
        // Act
        var heure = FeuilleAgenda.LireHeure(saisie);

        // Assert
        heure.Should().Be(new TimeOnly(heures, minutes));
    }

    [Fact]
    public void LireHeure_FractionDeJour_EstConvertie()
    {
        // Act
        var heure = FeuilleAgenda.LireHeure(0.625d);

        // Assert
        heure.Should().Be(new TimeOnly(15, 0));
    }

    [Fact]
    public void LireParticipants_NomsEtEmails_SontSepares()
    {
        // Act
        var participants = FeuilleAgenda.LireParticipants("Nina Leroy <nina@exemple.com>; Louis Petit; paul@exemple.com");

        // Assert
        participants.Should().Equal(
            new ParticipantLu("Nina Leroy", "nina@exemple.com"),
            new ParticipantLu("Louis Petit", null),
            new ParticipantLu(null, "paul@exemple.com"));
    }

    [Theory]
    [InlineData("Temps bloqué", NatureLigne.TempsBloque)]
    [InlineData("  RÉUNION ", NatureLigne.Reunion)]
    [InlineData("Deplacement", NatureLigne.Deplacement)]
    [InlineData("", NatureLigne.RendezVous)]
    [InlineData("Conférence", NatureLigne.Inconnue)]
    public void LireNature_IgnoreCasseEtAccents(string saisie, NatureLigne attendue)
    {
        // Act & Assert
        FeuilleAgenda.LireNature(saisie).Should().Be(attendue);
    }

    [Fact]
    public void Blocs_LigneExistante_NEcritQueLesColonnesDeLApplication()
    {
        // Arrange
        var element = Element();

        // Act
        var blocs = FeuilleAgenda.Blocs("Agenda", 5, element, nouvelleLigne: false);

        // Assert
        blocs.Select(b => b.Plage).Should().Equal(
            "'Agenda'!A5:B5", "'Agenda'!D5:E5", "'Agenda'!G5:J5", "'Agenda'!L5:O5");
    }

    [Fact]
    public void Blocs_NouvelleLigne_RenseigneAussiLeLieu()
    {
        // Act
        var blocs = FeuilleAgenda.Blocs("Agenda", 7, Element(), nouvelleLigne: true);

        // Assert
        blocs.Should().Contain(b => b.Plage == "'Agenda'!K7:K7");
    }

    [Fact]
    public void LigneDe_EtPremiereLigneLibre_SuiventLesIdentifiants()
    {
        // Arrange
        var id = Guid.CreateVersion7();
        IList<IList<object?>> lignes =
        [
            ["", 46290d],
            [id.ToString(), 46291d],
            [],
        ];

        // Act & Assert
        FeuilleAgenda.LigneDe(lignes, id).Should().Be(3);
        FeuilleAgenda.PremiereLigneLibre(lignes).Should().Be(4);
    }

    [Fact]
    public void Statut_EtPriorite_SuiventLesListesDuSheet()
    {
        // Act & Assert
        Enum.GetValues<StatutDemande>().Should().OnlyContain(s => FeuilleAgenda.Statuts.Contains(FeuilleAgenda.Statut(s)));
        FeuilleAgenda.Statut(StatutDemande.EnAttente).Should().Be("À confirmer");
        FeuilleAgenda.Statut(StatutDemande.Acceptee).Should().Be("Accepté");
        FeuilleAgenda.Statut(StatutDemande.Planifiee).Should().Be("Confirmé");
        FeuilleAgenda.Priorites.Should().Contain(FeuilleAgenda.Priorite(Priorite.Faible));
        FeuilleAgenda.LirePriorite("basse").Should().Be(Priorite.Faible);
    }

    private static ElementAgenda Element() =>
        new(
            Guid.CreateVersion7(),
            new DateTime(2026, 10, 5, 9, 0, 0),
            new DateTime(2026, 10, 5, 10, 30, 0),
            "Réunion",
            "Comité de direction",
            "Holding Démo",
            "Claire Martin",
            "Salle Conseil",
            "Louis Petit",
            "Alice Bernard",
            "Haute",
            "Confirmé");
}
