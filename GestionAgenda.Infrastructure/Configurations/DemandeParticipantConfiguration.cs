using GestionAgenda.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionAgenda.Infrastructure.Configurations;

public sealed class DemandeParticipantConfiguration : IEntityTypeConfiguration<DemandeParticipant>
{
    public void Configure(EntityTypeBuilder<DemandeParticipant> builder)
    {
        builder.ToTable("DemandeParticipants", table =>
        {
            table.HasCheckConstraint(
                "CK_Participant_Identite",
                "([UtilisateurId] IS NOT NULL AND [NomComplet] IS NULL AND [Email] IS NULL) OR " +
                "([UtilisateurId] IS NULL AND [NomComplet] IS NOT NULL AND [Email] IS NOT NULL)");
        });
        builder.Property(p => p.NomComplet).HasMaxLength(200);
        builder.Property(p => p.Email).HasMaxLength(256);
        builder.HasOne<Utilisateur>().WithMany().HasForeignKey(p => p.UtilisateurId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(p => new { p.DemandeRencontreId, p.UtilisateurId })
            .IsUnique()
            .HasFilter("[UtilisateurId] IS NOT NULL");
        builder.HasIndex(p => new { p.DemandeRencontreId, p.Email })
            .IsUnique()
            .HasFilter("[Email] IS NOT NULL");
    }
}
