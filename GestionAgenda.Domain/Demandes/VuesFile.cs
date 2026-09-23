using System.Linq.Expressions;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Domain.Demandes;

public static class VuesFile
{
    public static Expression<Func<DemandeRencontre, bool>> Pour(VueFile vue) => vue switch
    {
        VueFile.Nouvelles => demande => demande.Statut == StatutDemande.EnAttente,
        VueFile.Urgentes => demande => demande.Urgence == Urgence.Urgent,
        VueFile.Critiques => demande => demande.Urgence == Urgence.Critique,
        VueFile.Prioritaires => demande =>
            demande.Priorite == Priorite.Haute || demande.Priorite == Priorite.Critique,
        VueFile.EnAttente => demande =>
            demande.Statut == StatutDemande.EnAttente || demande.Statut == StatutDemande.EnAnalyse,
        VueFile.Planifiees => demande => demande.Statut == StatutDemande.Planifiee,
        _ => throw new DomainException("La vue demandée est inconnue."),
    };
}
