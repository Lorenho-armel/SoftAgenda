using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace GestionAgenda.Infrastructure.Context;

public sealed class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>();
        options.UseSqlServer(LireChaine());
        return new ApplicationDbContext(options.Options);
    }

    private static string LireChaine()
    {
        var environnement = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
        var configuration = new ConfigurationBuilder()
            .SetBasePath(TrouverDossierApi())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile($"appsettings.{environnement}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();
        var chaine = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(chaine))
        {
            throw new InvalidOperationException("ConnectionStrings:DefaultConnection est absente.");
        }

        return chaine;
    }

    private static string TrouverDossierApi()
    {
        var departs = new[] { Directory.GetCurrentDirectory(), AppContext.BaseDirectory };
        foreach (var depart in departs)
        {
            var courant = new DirectoryInfo(depart);
            while (courant is not null)
            {
                if (courant.Name == "GestionAgenda.API"
                    && File.Exists(Path.Combine(courant.FullName, "appsettings.json")))
                {
                    return courant.FullName;
                }

                var api = Path.Combine(courant.FullName, "GestionAgenda.API", "appsettings.json");
                var imbrique = Path.Combine(courant.FullName, "GestionAgenda", "GestionAgenda.API", "appsettings.json");
                if (File.Exists(api))
                {
                    return Path.GetDirectoryName(api)!;
                }

                if (File.Exists(imbrique))
                {
                    return Path.GetDirectoryName(imbrique)!;
                }

                courant = courant.Parent;
            }
        }

        throw new InvalidOperationException("GestionAgenda.API/appsettings.json est introuvable.");
    }
}
