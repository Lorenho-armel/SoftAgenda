using GestionAgenda.Domain.Common;

namespace GestionAgenda.Domain.Entities;

public sealed class Societe : BaseEntity
{
    private Societe()
    {
    }

    public string Nom { get; private set; } = string.Empty;

    public static Societe Creer(string nom) => new() { Nom = nom.Trim() };
}
