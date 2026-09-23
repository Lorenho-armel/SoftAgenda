using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

public static class SelectionRappels
{
    public static HorizonRappel? Pour(DateTimeOffset maintenant, DateTimeOffset debut)
    {
        if (debut <= maintenant || debut > maintenant.AddHours(24))
        {
            return null;
        }

        return debut <= maintenant.AddHours(1) ? HorizonRappel.Heure : HorizonRappel.Jour;
    }
}
