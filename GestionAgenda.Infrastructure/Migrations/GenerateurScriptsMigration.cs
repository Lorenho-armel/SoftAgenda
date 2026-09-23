using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GestionAgenda.Infrastructure.Migrations;

public sealed class GenerateurScriptsMigration(
    ApplicationDbContext contexte,
    IHostEnvironment environnement,
    ILogger<GenerateurScriptsMigration> journal)
{
    public async Task EcrireAsync(CancellationToken cancellationToken = default)
    {
        var dossier = ResoudreDossier();
        if (dossier is null)
        {
            return;
        }

        Directory.CreateDirectory(dossier);
        await EcrireChaqueMigrationAsync(dossier, cancellationToken);
    }

    private string? ResoudreDossier()
    {
        var projet = Path.GetFullPath(Path.Combine(
            environnement.ContentRootPath,
            "..",
            "GestionAgenda.Infrastructure"));
        var projetExiste = File.Exists(Path.Combine(projet, "GestionAgenda.Infrastructure.csproj"));
        if (!projetExiste)
        {
            journal.LogInformation("Scripts de migration ignorés : projet Infrastructure introuvable.");
            return null;
        }

        return Path.Combine(projet, "Migrations", "Scripts");
    }

    private async Task EcrireChaqueMigrationAsync(string dossier, CancellationToken cancellationToken)
    {
        var migrator = contexte.Database.GetService<IMigrator>()
            ?? throw new InvalidOperationException("Le générateur SQL des migrations est indisponible.");
        string? precedente = null;
        foreach (var migration in contexte.Database.GetMigrations())
        {
            var sql = migrator.GenerateScript(precedente, migration);
            var chemin = Path.Combine(dossier, $"{migration}.sql");
            await File.WriteAllTextAsync(chemin, sql, cancellationToken);
            precedente = migration;
        }
    }
}
