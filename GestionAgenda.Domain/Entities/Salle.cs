using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Domain.Entities;

public sealed class Salle : BaseEntity
{
    private Salle()
    {
    }

    public Guid SocieteId { get; private set; }

    public string Nom { get; private set; } = string.Empty;

    public int Capacite { get; private set; }

    public bool EstActive { get; private set; }

    public static Salle Creer(Guid societeId, string nom, int capacite)
    {
        if (capacite < 1)
        {
            throw new DomainException("La capacité de la salle doit être positive.");
        }

        return new Salle
        {
            SocieteId = societeId,
            Nom = nom.Trim(),
            Capacite = capacite,
            EstActive = true,
        };
    }
}
