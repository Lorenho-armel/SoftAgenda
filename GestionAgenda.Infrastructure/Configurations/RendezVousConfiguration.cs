using GestionAgenda.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionAgenda.Infrastructure.Configurations;

public sealed class RendezVousConfiguration : IEntityTypeConfiguration<RendezVous>
{
    public void Configure(EntityTypeBuilder<RendezVous> builder)
    {
        builder.ToTable("RendezVous", table =>
            table.HasCheckConstraint("CK_RendezVous_Creneau", "[Fin] > [Debut]"));
        builder.Property(r => r.Titre).HasMaxLength(500).IsRequired();
        builder.Property(r => r.Statut).HasConversion<string>().HasMaxLength(20);
        builder.HasOne(r => r.Demande).WithOne(d => d.RendezVous).HasForeignKey<RendezVous>(r => r.DemandeRencontreId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(r => r.DemandeRencontreId).IsUnique().HasFilter("[DemandeRencontreId] IS NOT NULL");
        builder.HasOne<Salle>().WithMany().HasForeignKey(r => r.SalleId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(r => new { r.DirigeantId, r.Debut, r.Fin });
        builder.HasIndex(r => new { r.SalleId, r.Debut, r.Fin });
    }
}
