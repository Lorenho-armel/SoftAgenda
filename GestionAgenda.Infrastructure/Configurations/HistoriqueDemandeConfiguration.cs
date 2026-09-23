using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionAgenda.Infrastructure.Configurations;

public sealed class HistoriqueDemandeConfiguration : IEntityTypeConfiguration<HistoriqueDemande>
{
    public void Configure(EntityTypeBuilder<HistoriqueDemande> builder)
    {
        builder.ToTable("HistoriqueDemandes");
        builder.Property(h => h.Commentaire).HasMaxLength(2000);
        builder.Property(h => h.TypeEvenement).HasConversion<string>().HasMaxLength(30);
        Convertir(builder.Property(h => h.StatutAvant));
        Convertir(builder.Property(h => h.StatutApres));
        builder.Property(h => h.UrgenceAvant).HasConversion<string>().HasMaxLength(20);
        builder.Property(h => h.UrgenceApres).HasConversion<string>().HasMaxLength(20);
        builder.Property(h => h.PrioriteAvant).HasConversion<string>().HasMaxLength(20);
        builder.Property(h => h.PrioriteApres).HasConversion<string>().HasMaxLength(20);
        builder.HasOne<Utilisateur>().WithMany().HasForeignKey(h => h.AuteurId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(h => new { h.DemandeRencontreId, h.DateCreation });
    }

    private static void Convertir(Microsoft.EntityFrameworkCore.Metadata.Builders.PropertyBuilder<StatutDemande?> propriete) =>
        propriete.HasConversion<string>().HasMaxLength(20);
}
