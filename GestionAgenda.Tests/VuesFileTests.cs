using FluentAssertions;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Tests;

public class VuesFileTests
{
    [Fact]
    public void Critiques_NeConfondPasPrioriteCritiqueEtUrgenceCritique()
    {
        // Arrange
        var prioritaire = Demande(Urgence.Normal, Priorite.Critique, StatutDemande.EnAttente);
        var critique = Demande(Urgence.Critique, Priorite.Faible, StatutDemande.EnAnalyse);

        // Act
        var estCritique = VuesFile.Pour(VueFile.Critiques).Compile();
        var estPrioritaire = VuesFile.Pour(VueFile.Prioritaires).Compile();

        // Assert
        estCritique(prioritaire).Should().BeFalse();
        estPrioritaire(prioritaire).Should().BeTrue();
        estCritique(critique).Should().BeTrue();
        estPrioritaire(critique).Should().BeFalse();
    }

    [Fact]
    public void Classement_PlaceCritiquePuisUrgentPuisDate()
    {
        // Arrange
        var tardiveCritique = Demande(Urgence.Critique, Priorite.Faible, StatutDemande.EnAttente, jours: 5);
        var urgenteHaute = Demande(Urgence.Urgent, Priorite.Haute, StatutDemande.EnAttente, jours: 1);
        var normale = Demande(Urgence.Normal, Priorite.Critique, StatutDemande.EnAttente, jours: 1);

        // Act
        var ordre = new[] { normale, urgenteHaute, tardiveCritique }
            .OrderBy(ClassementFile.RangUrgence.Compile())
            .ThenBy(ClassementFile.RangPriorite.Compile())
            .ThenBy(d => d.DateDebutSouhaitee)
            .ThenBy(d => d.DateCreation)
            .ToList();

        // Assert
        ordre.Select(d => d.Urgence).Should().Equal(Urgence.Critique, Urgence.Urgent, Urgence.Normal);
    }

    [Theory]
    [InlineData(VueFile.Nouvelles, StatutDemande.EnAttente, true)]
    [InlineData(VueFile.Nouvelles, StatutDemande.EnAnalyse, false)]
    [InlineData(VueFile.EnAttente, StatutDemande.EnAnalyse, true)]
    [InlineData(VueFile.Planifiees, StatutDemande.Planifiee, true)]
    [InlineData(VueFile.Urgentes, StatutDemande.EnAttente, false)]
    public void Vue_ReposeSurLaValeurMetierEnregistree(VueFile vue, StatutDemande statut, bool attendu)
    {
        // Arrange
        var demande = Demande(Urgence.Normal, Priorite.Moyenne, statut);

        // Act
        var resultat = VuesFile.Pour(vue).Compile()(demande);

        // Assert
        resultat.Should().Be(attendu);
    }

    private static DemandeRencontre Demande(Urgence urgence, Priorite priorite, StatutDemande statut, int jours = 2)
    {
        var debut = DateTimeOffset.UtcNow.AddDays(jours);
        var demande = DemandeRencontre.Creer(new NouvelleDemande(
            Guid.CreateVersion7(),
            Guid.CreateVersion7(),
            Guid.CreateVersion7(),
            TypeDemande.RendezVous,
            "Point budget trimestriel",
            debut,
            debut.AddHours(2),
            60,
            urgence,
            priorite,
            null,
            []));
        if (statut is StatutDemande.EnAnalyse or StatutDemande.Planifiee)
        {
            demande.PrendreEnAnalyse(Guid.CreateVersion7(), null);
        }

        if (statut == StatutDemande.Planifiee)
        {
            demande.Accepter(Guid.CreateVersion7(), null);
            demande.PlanifierRendezVous(
                RendezVous.Planifier(new CreneauPlanifie(
                    demande.DirigeantId,
                    demande.SocieteId,
                    demande.Id,
                    null,
                    demande.DateDebutSouhaitee,
                    demande.DateDebutSouhaitee.AddMinutes(demande.DureeMinutes),
                    demande.Motif)),
                Guid.CreateVersion7(),
                null);
        }

        return demande;
    }
}
