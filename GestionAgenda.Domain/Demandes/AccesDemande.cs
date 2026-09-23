namespace GestionAgenda.Domain.Demandes;

public static class AccesDemande
{
    public static bool PeutVoir(bool estDemandeur, bool estDirigeant, bool estAssistanteActive) =>
        estDemandeur || estDirigeant || estAssistanteActive;

    public static bool EstGestionnaire(
        bool estDirigeantCible,
        bool estAssistanteActive,
        bool dirigeantAUneAssistanteActive) =>
        estAssistanteActive || (estDirigeantCible && !dirigeantAUneAssistanteActive);

    public static bool DemandeurPeutAnnuler(Enums.StatutDemande statut) =>
        statut is Enums.StatutDemande.EnAttente
            or Enums.StatutDemande.EnAnalyse
            or Enums.StatutDemande.Acceptee
            or Enums.StatutDemande.Reportee;
}
