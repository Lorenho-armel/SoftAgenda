using FluentAssertions;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Tests;

public class TableauAssistanteTests
{
    [Fact]
    public void Indicateurs_SeparentUrgenceEtPriorite()
    {
        // Arrange
        var urgente = Demande(Urgence.Urgent, Priorite.Faible, StatutDemande.EnAttente);
        var critique = Demande(Urgence.Critique, Priorite.Moyenne, StatutDemande.EnAnalyse);
        var prioritaire = Demande(Urgence.Normal, Priorite.Critique, StatutDemande.EnAttente);
        var refusee = Demande(Urgence.Urgent, Priorite.Critique, StatutDemande.Refusee);

        // Act
        var urgentes = TableauAssistante.Urgentes.Compile();
        var critiques = TableauAssistante.Critiques.Compile();
        var prioritaires = TableauAssistante.Prioritaires.Compile();

        // Assert
        urgentes(urgente).Should().BeTrue();
        critiques(urgente).Should().BeFalse();
        prioritaires(urgente).Should().BeFalse();
        critiques(critique).Should().BeTrue();
        prioritaires(critique).Should().BeFalse();
        prioritaires(prioritaire).Should().BeTrue();
        critiques(prioritaire).Should().BeFalse();
        urgentes(refusee).Should().BeFalse();
        prioritaires(refusee).Should().BeFalse();
    }

    [Fact]
    public void ATraiter_NeGardeQueLesDemandesEnCoursDeTraitement()
    {
        // Arrange
        var filtre = TableauAssistante.ATraiter.Compile();
        var attente = Demande(Urgence.Normal, Priorite.Moyenne, StatutDemande.EnAttente);
        var analyse = Demande(Urgence.Normal, Priorite.Moyenne, StatutDemande.EnAnalyse);
        var acceptee = Demande(Urgence.Normal, Priorite.Moyenne, StatutDemande.Acceptee);

        // Assert
        filtre(attente).Should().BeTrue();
        filtre(analyse).Should().BeTrue();
        filtre(acceptee).Should().BeFalse();
        TableauAssistante.Acceptees.Compile()(acceptee).Should().BeTrue();
        TableauAssistante.Reportees.Compile()(Demande(Urgence.Normal, Priorite.Moyenne, StatutDemande.Reportee)).Should().BeTrue();
    }

    [Fact]
    public void ATraiter_ClasseUrgencePuisPrioriteSansLesFusionner()
    {
        // Arrange
        var proche = DateTimeOffset.UtcNow.AddDays(1);
        var critiqueFaible = Demande(Urgence.Critique, Priorite.Faible, StatutDemande.EnAttente, proche.AddDays(2));
        var urgenteHaute = Demande(Urgence.Urgent, Priorite.Haute, StatutDemande.EnAnalyse, proche);
        var normaleCritique = Demande(Urgence.Normal, Priorite.Critique, StatutDemande.EnAttente, proche);

        // Act
        var ordre = new[] { normaleCritique, urgenteHaute, critiqueFaible }
            .Where(TableauAssistante.ATraiter.Compile())
            .OrderBy(ClassementFile.RangUrgence.Compile())
            .ThenBy(ClassementFile.RangPriorite.Compile())
            .ThenBy(demande => demande.DateDebutSouhaitee)
            .ToList();

        // Assert
        ordre.Select(demande => demande.Urgence).Should().Equal(Urgence.Critique, Urgence.Urgent, Urgence.Normal);
        ordre[0].Priorite.Should().Be(Priorite.Faible);
        ordre[2].Priorite.Should().Be(Priorite.Critique);
    }

    [Fact]
    public void Rencontres_SeparentAujourdhuiEtLaSuite()
    {
        // Arrange
        var debut = DateTimeOffset.UtcNow.AddDays(2);
        var jour = new DateTimeOffset(debut.UtcDateTime.Date, TimeSpan.Zero);
        var aujourdHui = Planifiee(debut);
        var suivante = Planifiee(debut.AddDays(1));

        // Act
        var duJour = TableauAssistante.DuJour(jour, jour.AddDays(1)).Compile();
        var apres = TableauAssistante.Apres(jour.AddDays(1)).Compile();

        // Assert
        duJour(aujourdHui).Should().BeTrue();
        apres(aujourdHui).Should().BeFalse();
        duJour(suivante).Should().BeFalse();
        apres(suivante).Should().BeTrue();
    }

    private static DemandeRencontre Planifiee(DateTimeOffset debut)
    {
        var demande = Demande(Urgence.Normal, Priorite.Moyenne, StatutDemande.Acceptee, debut);
        demande.PlanifierRendezVous(
            RendezVous.Planifier(new CreneauPlanifie(
                demande.DirigeantId,
                demande.SocieteId,
                demande.Id,
                null,
                debut,
                debut.AddMinutes(demande.DureeMinutes),
                demande.Motif)),
            Guid.CreateVersion7(),
            null);
        return demande;
    }

    private static DemandeRencontre Demande(
        Urgence urgence,
        Priorite priorite,
        StatutDemande statut,
        DateTimeOffset? debut = null)
    {
        var debutSouhaite = debut ?? DateTimeOffset.UtcNow.AddDays(2);
        var demande = DemandeRencontre.Creer(new NouvelleDemande(
            Guid.CreateVersion7(),
            Guid.CreateVersion7(),
            Guid.CreateVersion7(),
            TypeDemande.RendezVous,
            "Point budget trimestriel",
            debutSouhaite,
            debutSouhaite.AddHours(2),
            60,
            urgence,
            priorite,
            null,
            []));
        Appliquer(demande, statut, debutSouhaite);
        return demande;
    }

    private static void Appliquer(DemandeRencontre demande, StatutDemande statut, DateTimeOffset debut)
    {
        if (statut == StatutDemande.EnAttente)
        {
            return;
        }

        demande.PrendreEnAnalyse(Guid.CreateVersion7(), null);
        if (statut == StatutDemande.EnAnalyse)
        {
            return;
        }

        if (statut == StatutDemande.Refusee)
        {
            demande.Refuser(Guid.CreateVersion7(), "Créneau incompatible");
            return;
        }

        if (statut == StatutDemande.Reportee)
        {
            demande.Reporter(new ReportDemande(Guid.CreateVersion7(), "Semaine suivante", debut, debut.AddHours(2)));
            return;
        }

        demande.Accepter(Guid.CreateVersion7(), null);
    }
}
