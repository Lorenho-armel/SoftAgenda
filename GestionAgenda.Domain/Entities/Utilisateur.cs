using GestionAgenda.Domain.Common;

namespace GestionAgenda.Domain.Entities;

public sealed class Utilisateur : BaseEntity
{
    private Utilisateur()
    {
    }

    public string Nom { get; private set; } = string.Empty;

    public string Prenom { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public string MotDePasseHash { get; private set; } = string.Empty;

    public static Utilisateur Creer(string nom, string prenom, string email, string motDePasseHash)
    {
        return new Utilisateur
        {
            Nom = nom.Trim(),
            Prenom = prenom.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            MotDePasseHash = motDePasseHash,
        };
    }
}
