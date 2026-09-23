using GestionAgenda.Domain.Entities;

namespace GestionAgenda.Domain.Demandes;

internal static class LiberationPlanification
{
    public static void Liberer(DemandeRencontre demande)
    {
        if (demande.RendezVous is not null)
        {
            demande.RendezVous.Annuler();
            demande.RendezVous.DetacherDemande();
            demande.RendezVous = null;
        }

        if (demande.Reunion is not null)
        {
            demande.Reunion.Annuler();
            demande.Reunion.DetacherDemande();
            demande.Reunion = null;
        }
    }
}
