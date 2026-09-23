using GestionAgenda.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionAgenda.Infrastructure.Configurations;

public sealed class SocieteConfiguration : IEntityTypeConfiguration<Societe>
{
    public void Configure(EntityTypeBuilder<Societe> builder)
    {
        builder.ToTable("Societes");
        builder.Property(s => s.Nom).HasMaxLength(200).IsRequired();
    }
}
