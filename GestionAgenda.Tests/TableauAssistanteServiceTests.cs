using AutoMapper;
using FluentAssertions;
using GestionAgenda.Application.DTOs.TableauAssistante;
using GestionAgenda.Application.Mappings;
using GestionAgenda.Application.Validators;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Services;
using Moq;

namespace GestionAgenda.Tests;

public class TableauAssistanteServiceTests
{
    [Fact]
    public async Task ObtenirAsync_JourneeInvalide_NAppellePasLeDepot()
    {
        // Arrange
        var depot = new Mock<ITableauAssistanteRepository>();
        var sut = Service(depot);
        var debut = DateTimeOffset.UtcNow;

        // Act
        var act = () => sut.ObtenirAsync(
            Guid.CreateVersion7(), new TableauAssistanteQuery(debut, debut.AddDays(2)), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<DomainException>();
        depot.Verify(
            d => d.ObtenirAsync(It.IsAny<Guid>(), It.IsAny<Intervalle>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task ObtenirAsync_ConserveUrgenceEtPrioriteSeparees()
    {
        // Arrange
        var demande = DemandeRencontre.Creer(Nouvelle(Urgence.Critique, Priorite.Faible));
        var debut = demande.DateDebutSouhaitee;
        var depot = new Mock<ITableauAssistanteRepository>();
        depot.Setup(d => d.ObtenirAsync(It.IsAny<Guid>(), It.IsAny<Intervalle>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new LectureTableauAssistante(
                new CompteursTableau(1, 0, 1, 0, 0, 0, 1),
                [demande],
                [
                    new RencontreTableau(
                        demande.Id,
                        demande.Motif,
                        Urgence.Urgent,
                        Priorite.Haute,
                        debut,
                        debut.AddHours(1),
                        "Claire Martin",
                        "Softwell"),
                ],
                []));
        var sut = Service(depot);
        var jour = new DateTimeOffset(debut.UtcDateTime.Date, TimeSpan.Zero);

        // Act
        var resultat = await sut.ObtenirAsync(
            Guid.CreateVersion7(), new TableauAssistanteQuery(jour, jour.AddDays(1)), CancellationToken.None);

        // Assert
        resultat.Compteurs.Critiques.Should().Be(1);
        resultat.Compteurs.Prioritaires.Should().Be(0);
        resultat.ATraiterMaintenant.Should().ContainSingle();
        resultat.ATraiterMaintenant[0].Urgence.Should().Be(Urgence.Critique);
        resultat.ATraiterMaintenant[0].Priorite.Should().Be(Priorite.Faible);
        resultat.RencontresAujourdhui[0].Urgence.Should().Be(Urgence.Urgent);
        resultat.RencontresAujourdhui[0].Priorite.Should().Be(Priorite.Haute);
        resultat.RencontresAujourdhui[0].DirigeantNom.Should().Be("Claire Martin");
    }

    private static TableauAssistanteService Service(Mock<ITableauAssistanteRepository> depot)
    {
        var mapper = new MapperConfiguration(cfg => cfg.AddProfile<DemandeRencontreProfile>()).CreateMapper();
        return new TableauAssistanteService(depot.Object, new TableauAssistanteQueryValidator(), mapper);
    }

    private static NouvelleDemande Nouvelle(Urgence urgence, Priorite priorite)
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
            urgence,
            priorite,
            null,
            []);
    }
}
