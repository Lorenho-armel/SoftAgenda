using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;
using FluentAssertions;

namespace GestionAgenda.Tests;

public class DemandeRencontreTests
{
    [Fact]
    public void Creer_DemandeValide_StatutEnAttenteEtHistoriqueCreation()
    {
        // Arrange
        var donnees = DemandeValide();

        // Act
        var sut = DemandeRencontre.Creer(donnees);

        // Assert
        sut.Statut.Should().Be(StatutDemande.EnAttente);
        sut.Historique.Should().ContainSingle(h => h.TypeEvenement == TypeEvenementDemande.Creation);
        sut.Urgence.Should().Be(Urgence.Urgent);
        sut.Priorite.Should().Be(Priorite.Haute);
    }

    [Fact]
    public void Creer_ReunionSansParticipant_ThrowsDomainException()
    {
        // Arrange
        var donnees = DemandeValide(TypeDemande.Reunion, []);

        // Act
        var act = () => DemandeRencontre.Creer(donnees);

        // Assert
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Creer_DemandeurEstDirigeant_ThrowsDomainException()
    {
        // Arrange
        var acteur = Guid.CreateVersion7();
        var donnees = DemandeValide() with { DemandeurId = acteur, DirigeantId = acteur };

        // Act
        var act = () => DemandeRencontre.Creer(donnees);

        // Assert
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Refuser_SansCommentaire_ThrowsDomainException()
    {
        // Arrange
        var sut = DemandeEnAnalyse();

        // Act
        var act = () => sut.Refuser(Guid.CreateVersion7(), " ");

        // Assert
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Accepter_DepuisEnAttente_PasseAAcceptee()
    {
        // Arrange
        var sut = DemandeRencontre.Creer(DemandeValide());

        // Act
        sut.Accepter(Guid.CreateVersion7(), null);

        // Assert
        sut.Statut.Should().Be(StatutDemande.Acceptee);
    }

    [Fact]
    public void Accepter_DepuisEnAnalyse_PasseAAcceptee()
    {
        // Arrange
        var sut = DemandeEnAnalyse();

        // Act
        sut.Accepter(Guid.CreateVersion7(), null);

        // Assert
        sut.Statut.Should().Be(StatutDemande.Acceptee);
    }

    [Fact]
    public void Planifier_DepuisEnAttente_ThrowsDomainException()
    {
        // Arrange
        var sut = DemandeRencontre.Creer(DemandeValide());
        var rendezVous = RendezVous.Planifier(new CreneauPlanifie(
            sut.DirigeantId, sut.SocieteId, sut.Id, null, sut.DateDebutSouhaitee, sut.DateDebutSouhaitee.AddMinutes(60), sut.Motif));

        // Act
        var act = () => sut.PlanifierRendezVous(rendezVous, Guid.CreateVersion7(), null);

        // Assert
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void ChangerUrgence_DemandeRefusee_ThrowsDomainException()
    {
        // Arrange
        var sut = DemandeEnAnalyse();
        sut.Refuser(Guid.CreateVersion7(), "Créneau impossible");

        // Act
        var act = () => sut.ChangerUrgence(Urgence.Critique, Guid.CreateVersion7(), null);

        // Assert
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Acces_DirigeantSansAssistante_EstGestionnaire()
    {
        // Arrange
        var estDirigeant = true;

        // Act
        var sut = AccesDemande.EstGestionnaire(estDirigeant, estAssistanteActive: false, dirigeantAUneAssistanteActive: false);

        // Assert
        sut.Should().BeTrue();
    }

    [Fact]
    public void Acces_DirigeantAvecAssistante_NEstPasGestionnaire()
    {
        // Arrange
        var estDirigeant = true;

        // Act
        var sut = AccesDemande.EstGestionnaire(estDirigeant, estAssistanteActive: false, dirigeantAUneAssistanteActive: true);

        // Assert
        sut.Should().BeFalse();
    }

    [Fact]
    public void Acces_AssistanteActive_EstGestionnaire()
    {
        // Arrange
        var estAssistante = true;

        // Act
        var sut = AccesDemande.EstGestionnaire(estDirigeantCible: false, estAssistante, dirigeantAUneAssistanteActive: true);

        // Assert
        sut.Should().BeTrue();
    }

    private static DemandeRencontre DemandeEnAnalyse()
    {
        var demande = DemandeRencontre.Creer(DemandeValide());
        demande.PrendreEnAnalyse(Guid.CreateVersion7(), null);
        return demande;
    }

    private static NouvelleDemande DemandeValide(
        TypeDemande type = TypeDemande.RendezVous,
        IReadOnlyList<NouveauParticipant>? participants = null) =>
        new(
            Guid.CreateVersion7(),
            Guid.CreateVersion7(),
            Guid.CreateVersion7(),
            type,
            "Point budget trimestriel",
            DateTimeOffset.UtcNow.AddDays(1),
            DateTimeOffset.UtcNow.AddDays(1).AddHours(2),
            60,
            Urgence.Urgent,
            Priorite.Haute,
            null,
            participants ?? []);
}
