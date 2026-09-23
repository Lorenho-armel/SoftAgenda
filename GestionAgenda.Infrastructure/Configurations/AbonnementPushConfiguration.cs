using GestionAgenda.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionAgenda.Infrastructure.Configurations;

public sealed class AbonnementPushConfiguration : IEntityTypeConfiguration<AbonnementPush>
{
    public void Configure(EntityTypeBuilder<AbonnementPush> builder)
    {
        builder.ToTable("AbonnementsPush");
        builder.Property(a => a.Endpoint).HasMaxLength(2000).IsRequired();
        builder.Property(a => a.CleP256dh).HasMaxLength(200).IsRequired();
        builder.Property(a => a.Auth).HasMaxLength(200).IsRequired();
        builder.HasIndex(a => a.Endpoint).IsUnique();
        builder.HasIndex(a => a.UtilisateurId);
        builder.HasOne<Utilisateur>().WithMany().HasForeignKey(a => a.UtilisateurId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
