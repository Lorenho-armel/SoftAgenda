using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Domain.Demandes;

public static class LibellesIndisponibilite
{
    public static string Type(TypeIndisponibilite type) => type switch
    {
        TypeIndisponibilite.Deplacement => "Déplacement",
        TypeIndisponibilite.TempsBloque => "Temps bloqué",
        TypeIndisponibilite.Personnel => "Personnel",
        TypeIndisponibilite.Evenement => "Événement",
        _ => "Indisponibilité",
    };

    public static string Titre(TypeIndisponibilite type, string motif) =>
        type == TypeIndisponibilite.Personnel ? "Indisponible (personnel)" : $"{Type(type)} : {motif}";
}
