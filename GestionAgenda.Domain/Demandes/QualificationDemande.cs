using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Domain.Demandes;

internal static class QualificationDemande
{
    public static void GarantirValeurs(TypeDemande type, Urgence urgence, Priorite priorite)
    {
        if (!Enum.IsDefined(type) || !Enum.IsDefined(urgence) || !Enum.IsDefined(priorite))
        {
            throw new DomainException("Le type, l'urgence ou la priorité est invalide.");
        }
    }

    public static void GarantirUrgenceModifiable(Urgence urgence, StatutDemande statut)
    {
        if (!Enum.IsDefined(urgence))
        {
            throw new DomainException("L'urgence est invalide.");
        }

        if (TransitionsDemande.EstTerminal(statut))
        {
            throw new DomainException("L'urgence ne peut plus être modifiée.");
        }
    }
}
