using GestionAgenda.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionAgenda.Infrastructure.Configurations;

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");
        builder.Property(n => n.Email).HasMaxLength(256).IsRequired();
        builder.Property(n => n.Titre).HasMaxLength(200).IsRequired();
        builder.Property(n => n.Message).HasMaxLength(1000).IsRequired();
        builder.Property(n => n.Evenement).HasConversion<string>().HasMaxLength(40);
        builder.HasIndex(n => new { n.DestinataireId, n.DateCreation });
        builder.HasOne<DemandeRencontre>().WithMany().HasForeignKey(n => n.DemandeId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Utilisateur>().WithMany().HasForeignKey(n => n.DestinataireId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
