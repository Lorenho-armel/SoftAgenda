using GestionAgenda.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionAgenda.Infrastructure.Configurations;

public sealed class IndisponibiliteConfiguration : IEntityTypeConfiguration<Indisponibilite>
{
    public void Configure(EntityTypeBuilder<Indisponibilite> builder)
    {
        builder.ToTable("Indisponibilites", table =>
            table.HasCheckConstraint("CK_Indisponibilites_Creneau", "[Fin] > [Debut]"));
        builder.Property(i => i.Motif).HasMaxLength(500).IsRequired();
        builder.Property(i => i.Type).HasConversion<string>().HasMaxLength(20);
        builder.HasOne<Utilisateur>().WithMany().HasForeignKey(i => i.DirigeantId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Societe>().WithMany().HasForeignKey(i => i.SocieteId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Utilisateur>().WithMany().HasForeignKey(i => i.AuteurId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(i => new { i.DirigeantId, i.Debut, i.Fin });
    }
}
