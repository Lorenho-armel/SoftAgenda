using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace GestionAgenda.Infrastructure.Seeding;

public sealed class DevDataSeeder(ApplicationDbContext context, IConfiguration configuration)
{
    public static readonly Guid SocieteId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid DirigeantId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid AssistanteId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    public static readonly Guid CollaborateurId = Guid.Parse("44444444-4444-4444-4444-444444444444");
    public static readonly Guid DirigeantSeulId = Guid.Parse("55555555-5555-5555-5555-555555555555");
    public static readonly Guid SalleId = Guid.Parse("66666666-6666-6666-6666-666666666666");

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (!configuration.GetValue("Seed:Enabled", false))
        {
            return;
        }

        if (!await context.Database.CanConnectAsync(cancellationToken))
        {
            throw new InvalidOperationException(
                "Base inaccessible. Appliquez la migration AjoutDemandesRencontre.");
        }

        if (await context.Utilisateurs.AnyAsync(cancellationToken))
        {
            return;
        }

        var motDePasse = configuration["Seed:Password"];
        if (string.IsNullOrWhiteSpace(motDePasse))
        {
            throw new InvalidOperationException("Seed:Password est absent.");
        }

        var hash = BCrypt.Net.BCrypt.HashPassword(motDePasse);
        var societe = Societe.Creer("Holding Démo");
        societe.AttribuerIdentifiant(SocieteId);
        var dirigeant = CreerUtilisateur(DirigeantId, "Martin", "Claire", "dirigeant@demo.local", hash);
        var assistante = CreerUtilisateur(AssistanteId, "Bernard", "Alice", "assistante@demo.local", hash);
        var collaborateur = CreerUtilisateur(CollaborateurId, "Petit", "Louis", "collaborateur@demo.local", hash);
        var dirigeantSeul = CreerUtilisateur(DirigeantSeulId, "Roux", "Marc", "dirigeant.seul@demo.local", hash);
        var salle = Salle.Creer(SocieteId, "Salle Conseil", 8);
        salle.AttribuerIdentifiant(SalleId);

        context.Add(societe);
        context.AddRange(dirigeant, assistante, collaborateur, dirigeantSeul);
        context.Add(UtilisateurSociete.Creer(DirigeantId, SocieteId, RoleSociete.Dirigeant));
        context.Add(UtilisateurSociete.Creer(AssistanteId, SocieteId, RoleSociete.Assistante));
        context.Add(UtilisateurSociete.Creer(CollaborateurId, SocieteId, RoleSociete.Collaborateur));
        context.Add(UtilisateurSociete.Creer(DirigeantSeulId, SocieteId, RoleSociete.Dirigeant));
        context.Add(AffectationAssistante.Creer(AssistanteId, DirigeantId, SocieteId));
        context.Add(salle);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static Utilisateur CreerUtilisateur(Guid id, string nom, string prenom, string email, string hash)
    {
        var utilisateur = Utilisateur.Creer(nom, prenom, email, hash);
        utilisateur.AttribuerIdentifiant(id);
        return utilisateur;
    }
}
