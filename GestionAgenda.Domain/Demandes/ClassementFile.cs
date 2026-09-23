using System.Linq.Expressions;
using GestionAgenda.Domain.Entities;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

public static class ClassementFile
{
    public static Expression<Func<DemandeRencontre, int>> RangUrgence =>
        demande => demande.Urgence == Urgence.Critique ? 0 : demande.Urgence == Urgence.Urgent ? 1 : 2;

    public static Expression<Func<DemandeRencontre, int>> RangPriorite =>
        demande => demande.Priorite == Priorite.Critique
            ? 0
            : demande.Priorite == Priorite.Haute
                ? 1
                : demande.Priorite == Priorite.Moyenne ? 2 : 3;

    public static IOrderedQueryable<DemandeRencontre> Appliquer(IQueryable<DemandeRencontre> requete) =>
        requete
            .OrderBy(RangUrgence)
            .ThenBy(RangPriorite)
            .ThenBy(demande => demande.DateDebutSouhaitee)
            .ThenBy(demande => demande.DateCreation);
}
