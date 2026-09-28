using FluentAssertions;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Tests;

public sealed class IndisponibiliteTests
{
    private static readonly DateTimeOffset Debut = new(2026, 10, 5, 8, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Creer_PlageValide_ConserveLesInformations()
    {
        // Act
        var sut = Indisponibilite.Creer(
            Guid.CreateVersion7(), Guid.CreateVersion7(), TypeIndisponibilite.Deplacement, "  Salon Paris ", Debut, Debut.AddHours(8), Guid.CreateVersion7());

        // Assert
        sut.Motif.Should().Be("Salon Paris");
        sut.Fin.Should().Be(Debut.AddHours(8));
    }

    [Fact]
    public void Creer_FinAvantDebut_Leve()
    {
        // Act
        var act = () => Indisponibilite.Creer(
            Guid.CreateVersion7(), Guid.CreateVersion7(), TypeIndisponibilite.TempsBloque, "Focus", Debut, Debut, Guid.CreateVersion7());

        // Assert
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Creer_PlusDUnMois_Leve()
    {
        // Act
        var act = () => Indisponibilite.Creer(
            Guid.CreateVersion7(), Guid.CreateVersion7(), TypeIndisponibilite.Deplacement, "Tournée", Debut, Debut.AddDays(40), Guid.CreateVersion7());

        // Assert
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Titre_Personnel_MasqueLeMotif()
    {
        // Act
        var titre = LibellesIndisponibilite.Titre(TypeIndisponibilite.Personnel, "Rendez-vous médical");

        // Assert
        titre.Should().NotContain("médical");
    }
}
