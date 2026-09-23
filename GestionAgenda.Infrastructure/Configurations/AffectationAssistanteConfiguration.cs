using GestionAgenda.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionAgenda.Infrastructure.Configurations;

public sealed class AffectationAssistanteConfiguration : IEntityTypeConfiguration<AffectationAssistante>
{
    public void Configure(EntityTypeBuilder<AffectationAssistante> builder)
    {
        builder.ToTable("AffectationAssistantes");
        builder.HasIndex(a => new { a.AssistanteId, a.DirigeantId, a.SocieteId }).IsUnique();
        builder.HasOne(a => a.Assistante).WithMany().HasForeignKey(a => a.AssistanteId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(a => a.Dirigeant).WithMany().HasForeignKey(a => a.DirigeantId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Societe>().WithMany().HasForeignKey(a => a.SocieteId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
