using GestionAgenda.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionAgenda.Infrastructure.Configurations;

public sealed class DemandeRencontreConfiguration : IEntityTypeConfiguration<DemandeRencontre>
{
    public void Configure(EntityTypeBuilder<DemandeRencontre> builder)
    {
        builder.ToTable("DemandeRencontres", table =>
        {
            table.HasCheckConstraint("CK_Demande_ActeursDistincts", "[DemandeurId] <> [DirigeantId]");
            table.HasCheckConstraint("CK_Demande_Periode", "[DateFinSouhaitee] > [DateDebutSouhaitee]");
            table.HasCheckConstraint("CK_Demande_Duree", "[DureeMinutes] >= 15 AND [DureeMinutes] <= 480");
        });

        builder.Property(d => d.Motif).HasMaxLength(500).IsRequired();
        builder.Property(d => d.Type).HasConversion<string>().HasMaxLength(20);
        builder.Property(d => d.Urgence).HasConversion<string>().HasMaxLength(20);
        builder.Property(d => d.Priorite).HasConversion<string>().HasMaxLength(20);
        builder.Property(d => d.Statut).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(d => d.Demandeur).WithMany().HasForeignKey(d => d.DemandeurId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(d => d.Dirigeant).WithMany().HasForeignKey(d => d.DirigeantId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(d => d.Societe).WithMany().HasForeignKey(d => d.SocieteId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Salle>().WithMany().HasForeignKey(d => d.SalleSouhaiteeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(d => d.Participants).WithOne(p => p.Demande!).HasForeignKey(p => p.DemandeRencontreId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(d => d.Historique).WithOne(h => h.Demande!).HasForeignKey(h => h.DemandeRencontreId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(d => d.Participants).UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.Navigation(d => d.Historique).UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(d => new { d.SocieteId, d.DirigeantId, d.Statut });
        builder.HasIndex(d => new { d.DirigeantId, d.DateDebutSouhaitee });
        builder.HasIndex(d => new { d.DemandeurId, d.Statut });
    }
}
