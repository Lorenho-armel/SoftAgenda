using AutoMapper;
using FluentAssertions;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Application.Mappings;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Tests;

public class DemandeRencontreProfileTests
{
    private readonly IMapper mapper = new MapperConfiguration(cfg => cfg.AddProfile<DemandeRencontreProfile>()).CreateMapper();

    [Fact]
    public void Map_DemandeurCharge_DonneLeNomComplet()
    {
        // Arrange
        var demande = Demande(Utilisateur.Creer("Petit", "Louis", "collaborateur@demo.local", "hash"));

        // Act
        var detail = mapper.Map<DemandeRencontreResponse>(demande);
        var resume = mapper.Map<DemandeRencontreResumeResponse>(demande);

        // Assert
        detail.DemandeurNom.Should().Be("Louis Petit");
        resume.DemandeurNom.Should().Be("Louis Petit");
    }

    private static DemandeRencontre Demande(Utilisateur demandeur)
    {
        var debut = DateTimeOffset.UtcNow.AddDays(3);
        var demande = DemandeRencontre.Creer(new NouvelleDemande(
            demandeur.Id, Guid.CreateVersion7(), Guid.CreateVersion7(), TypeDemande.RendezVous, "Point budget",
            debut, debut.AddHours(2), 60, Urgence.Normal, Priorite.Moyenne, null, []));
        typeof(DemandeRencontre).GetProperty(nameof(DemandeRencontre.Demandeur))!.SetValue(demande, demandeur);
        return demande;
    }
}
