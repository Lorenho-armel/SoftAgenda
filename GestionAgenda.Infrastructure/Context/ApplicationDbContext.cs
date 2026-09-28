using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GestionAgenda.Infrastructure.Context;

public sealed class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Societe> Societes => Set<Societe>();

    public DbSet<Utilisateur> Utilisateurs => Set<Utilisateur>();

    public DbSet<UtilisateurSociete> UtilisateurSocietes => Set<UtilisateurSociete>();

    public DbSet<AffectationAssistante> AffectationAssistantes => Set<AffectationAssistante>();

    public DbSet<Salle> Salles => Set<Salle>();

    public DbSet<DemandeRencontre> DemandesRencontre => Set<DemandeRencontre>();

    public DbSet<DemandeParticipant> DemandeParticipants => Set<DemandeParticipant>();

    public DbSet<HistoriqueDemande> HistoriqueDemandes => Set<HistoriqueDemande>();

    public DbSet<RendezVous> RendezVous => Set<RendezVous>();

    public DbSet<Reunion> Reunions => Set<Reunion>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<Notification> Notifications => Set<Notification>();

    public DbSet<AbonnementPush> AbonnementsPush => Set<AbonnementPush>();

    public DbSet<Indisponibilite> Indisponibilites => Set<Indisponibilite>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Les identifiants sont attribués par le domaine (Guid v7) : sans ValueGeneratedNever, EF traite
        // une entité enfant ajoutée à un agrégat suivi comme existante et émet un UPDATE au lieu d'un INSERT.
        foreach (var entite in modelBuilder.Model.GetEntityTypes()
                     .Where(type => typeof(BaseEntity).IsAssignableFrom(type.ClrType)))
        {
            modelBuilder.Entity(entite.ClrType).Property(nameof(BaseEntity.Id)).ValueGeneratedNever();
        }
    }
}
