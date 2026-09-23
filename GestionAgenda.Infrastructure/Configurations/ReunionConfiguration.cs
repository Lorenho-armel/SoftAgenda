using GestionAgenda.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionAgenda.Infrastructure.Configurations;

public sealed class ReunionConfiguration : IEntityTypeConfiguration<Reunion>
{
    public void Configure(EntityTypeBuilder<Reunion> builder)
    {
        builder.ToTable("Reunions", table =>
            table.HasCheckConstraint("CK_Reunion_Creneau", "[Fin] > [Debut]"));
        builder.Property(r => r.Titre).HasMaxLength(500).IsRequired();
        builder.Property(r => r.Statut).HasConversion<string>().HasMaxLength(20);
        builder.HasOne(r => r.Demande).WithOne(d => d.Reunion).HasForeignKey<Reunion>(r => r.DemandeRencontreId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(r => r.DemandeRencontreId).IsUnique().HasFilter("[DemandeRencontreId] IS NOT NULL");
        builder.HasOne<Salle>().WithMany().HasForeignKey(r => r.SalleId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(r => new { r.DirigeantId, r.Debut, r.Fin });
        builder.HasIndex(r => new { r.SalleId, r.Debut, r.Fin });
    }
}
