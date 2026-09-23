using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace GestionAgenda.Infrastructure.Context;

public sealed class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>();
        options.UseSqlServer(
            "Server=(localdb)\\mssqllocaldb;Database=GestionAgenda;Trusted_Connection=True;TrustServerCertificate=True");
        return new ApplicationDbContext(options.Options);
    }
}
