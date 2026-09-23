using FluentAssertions;
using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionAgenda.Tests;

public class MigrationDemandesTests
{
    [Fact]
    public async Task Migrations_creent_les_tables_des_demandes_et_des_notifications()
    {
        var chaine = Environment.GetEnvironmentVariable("GESTIONAGENDA_TEST_SQL")
            ?? "Server=localhost\\SQLEXPRESS;Database=GestionAgenda_Integration;Trusted_Connection=True;TrustServerCertificate=True";
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlServer(chaine).Options;
        await using var context = new ApplicationDbContext(options);

        await context.Database.MigrateAsync();

        var compte = await CompterTablesAsync(context);
        compte.Should().Be(2);
    }

    private static async Task<int> CompterTablesAsync(ApplicationDbContext context)
    {
        var connexion = context.Database.GetDbConnection();
        if (connexion.State != System.Data.ConnectionState.Open)
        {
            await connexion.OpenAsync();
        }

        await using var commande = connexion.CreateCommand();
        commande.CommandText =
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN ('DemandeRencontres', 'Notifications')";
        var resultat = await commande.ExecuteScalarAsync();
        return Convert.ToInt32(resultat);
    }
}
