using GestionAgenda.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionAgenda.Infrastructure.Configurations;

public sealed class SalleConfiguration : IEntityTypeConfiguration<Salle>
{
    public void Configure(EntityTypeBuilder<Salle> builder)
    {
        builder.ToTable("Salles");
        builder.Property(s => s.Nom).HasMaxLength(200).IsRequired();
        builder.HasOne<Societe>().WithMany().HasForeignKey(s => s.SocieteId).OnDelete(DeleteBehavior.Restrict);
    }
}
