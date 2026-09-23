using FluentAssertions;
using GestionAgenda.Domain.Demandes;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Tests;

public class SelectionRappelsTests
{
    [Fact]
    public void Pour_DansLHeure_RetourneHeure()
    {
        var maintenant = new DateTimeOffset(2026, 9, 23, 8, 0, 0, TimeSpan.Zero);

        SelectionRappels.Pour(maintenant, maintenant.AddMinutes(30)).Should().Be(HorizonRappel.Heure);
    }

    [Fact]
    public void Pour_DansLaJournee_RetourneJour()
    {
        var maintenant = new DateTimeOffset(2026, 9, 23, 8, 0, 0, TimeSpan.Zero);

        SelectionRappels.Pour(maintenant, maintenant.AddHours(5)).Should().Be(HorizonRappel.Jour);
    }

    [Fact]
    public void Pour_AuDelaDe24Heures_RetourneNull()
    {
        var maintenant = new DateTimeOffset(2026, 9, 23, 8, 0, 0, TimeSpan.Zero);

        SelectionRappels.Pour(maintenant, maintenant.AddHours(25)).Should().BeNull();
    }

    [Fact]
    public void Pour_DejaCommence_RetourneNull()
    {
        var maintenant = new DateTimeOffset(2026, 9, 23, 8, 0, 0, TimeSpan.Zero);

        SelectionRappels.Pour(maintenant, maintenant.AddMinutes(-5)).Should().BeNull();
    }
}
