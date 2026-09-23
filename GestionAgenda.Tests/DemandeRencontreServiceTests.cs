using AutoMapper;
using FluentAssertions;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Application.Mappings;
using GestionAgenda.Application.Validators;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;
using GestionAgenda.Domain.Interfaces;
using GestionAgenda.Infrastructure.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace GestionAgenda.Tests;

public class DemandeRencontreServiceTests
{
    [Fact]
    public async Task CreateAsync_DemandeValide_PersisteEtRetourneEnAttente()
    {
        // Arrange
        var demandes = new Mock<IDemandeRencontreRepository>();
        var acces = new Mock<IAccesAgendaRepository>();
        var planification = new Mock<IPlanificationRepository>();
        var unitOfWork = new Mock<IUnitOfWork>();
        acces.Setup(a => a.EstMembreAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(true);
        acces.Setup(a => a.EstDirigeantAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(true);
        acces.Setup(a => a.SontMembresAsync(It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var sut = CreerSut(demandes, acces, planification, unitOfWork);
        var request = new CreerDemandeRencontreRequest(
            Guid.CreateVersion7(), Guid.CreateVersion7(), TypeDemande.RendezVous, "Point budget trimestriel",
            DateTimeOffset.UtcNow.AddDays(2), DateTimeOffset.UtcNow.AddDays(2).AddHours(2), 60,
            Urgence.Critique, Priorite.Faible, null, []);

        // Act
        var resultat = await sut.CreateAsync(request, Guid.CreateVersion7(), CancellationToken.None);

        // Assert
        resultat.Statut.Should().Be(StatutDemande.EnAttente);
        resultat.Urgence.Should().Be(Urgence.Critique);
        resultat.Priorite.Should().Be(Priorite.Faible);
        demandes.Verify(d => d.AddAsync(It.IsAny<DemandeRencontre>(), It.IsAny<CancellationToken>()), Times.Once);
        unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_DemandeurHorsSociete_ThrowsForbidden()
    {
        // Arrange
        var acces = new Mock<IAccesAgendaRepository>();
        acces.Setup(a => a.EstMembreAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var sut = CreerSut(new Mock<IDemandeRencontreRepository>(), acces, new Mock<IPlanificationRepository>(), new Mock<IUnitOfWork>());
        var request = new CreerDemandeRencontreRequest(
            Guid.CreateVersion7(), Guid.CreateVersion7(), TypeDemande.RendezVous, "Point budget trimestriel",
            DateTimeOffset.UtcNow.AddDays(2), DateTimeOffset.UtcNow.AddDays(2).AddHours(2), 60,
            Urgence.Normal, Priorite.Moyenne, null, []);

        // Act
        var act = () => sut.CreateAsync(request, Guid.CreateVersion7(), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ForbiddenException>();
    }

    private static DemandeRencontreService CreerSut(
        Mock<IDemandeRencontreRepository> demandes,
        Mock<IAccesAgendaRepository> acces,
        Mock<IPlanificationRepository> planification,
        Mock<IUnitOfWork> unitOfWork)
    {
        var mapper = new MapperConfiguration(cfg => cfg.AddProfile<DemandeRencontreProfile>()).CreateMapper();
        return new DemandeRencontreService(
            demandes.Object,
            acces.Object,
            planification.Object,
            new PlanificationDemande(planification.Object),
            unitOfWork.Object,
            new CreerDemandeRencontreRequestValidator(),
            new MettreAJourDemandeRencontreRequestValidator(),
            new ChangerStatutDemandeRequestValidator(),
            new ChangerPrioriteDemandeRequestValidator(),
            new ChangerUrgenceDemandeRequestValidator(),
            new DemandeRencontreQueryValidator(),
            new VerifierCreneauRequestValidator(),
            mapper,
            NullLogger<DemandeRencontreService>.Instance);
    }
}
