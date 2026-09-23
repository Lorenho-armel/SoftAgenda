using GestionAgenda.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionAgenda.Infrastructure.Configurations;

public sealed class UtilisateurSocieteConfiguration : IEntityTypeConfiguration<UtilisateurSociete>
{
    public void Configure(EntityTypeBuilder<UtilisateurSociete> builder)
    {
        builder.ToTable("UtilisateurSocietes");
        builder.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
        builder.HasIndex(u => new { u.UtilisateurId, u.SocieteId, u.Role }).IsUnique();
        builder.HasOne(u => u.Utilisateur).WithMany().HasForeignKey(u => u.UtilisateurId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(u => u.Societe).WithMany().HasForeignKey(u => u.SocieteId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
