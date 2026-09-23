using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.Domain.Demandes;

internal static class InvariantsDemande
{
    public static void GarantirIdentite(Guid demandeurId, Guid dirigeantId)
    {
        if (demandeurId == dirigeantId)
        {
            throw new DomainException("Le demandeur et le dirigeant doivent être distincts.");
        }
    }

    public static string GarantirMotif(string motif)
    {
        var texte = motif.Trim();
        if (texte.Length < LimitesDemande.MotifMin || texte.Length > LimitesDemande.MotifMax)
        {
            throw new DomainException(
                $"Le motif doit contenir entre {LimitesDemande.MotifMin} et {LimitesDemande.MotifMax} caractères.");
        }

        return texte;
    }

    public static void GarantirPeriode(
        DateTimeOffset debut,
        DateTimeOffset fin,
        int duree,
        bool exigerFutur)
    {
        if (exigerFutur && debut <= DateTimeOffset.UtcNow)
        {
            throw new DomainException("La période souhaitée doit commencer dans le futur.");
        }

        if (fin <= debut)
        {
            throw new DomainException("La fin de la période souhaitée doit être postérieure au début.");
        }

        if (duree < LimitesDemande.DureeMin || duree > LimitesDemande.DureeMax)
        {
            throw new DomainException(
                $"La durée doit être comprise entre {LimitesDemande.DureeMin} et {LimitesDemande.DureeMax} minutes.");
        }

        if (duree > (fin - debut).TotalMinutes)
        {
            throw new DomainException("La durée dépasse la période souhaitée.");
        }
    }

    public static string? NormaliserCommentaire(string? commentaire)
    {
        if (string.IsNullOrWhiteSpace(commentaire))
        {
            return null;
        }

        var texte = commentaire.Trim();
        if (texte.Length > LimitesDemande.CommentaireMax)
        {
            throw new DomainException(
                $"Le commentaire interne dépasse {LimitesDemande.CommentaireMax} caractères.");
        }

        return texte;
    }

    public static string ExigerCommentaire(string? commentaire)
    {
        var texte = NormaliserCommentaire(commentaire);
        if (texte is null)
        {
            throw new DomainException("Un commentaire interne est obligatoire.");
        }

        return texte;
    }

    public static void GarantirCreneauDansPeriode(
        DateTimeOffset debutPeriode,
        DateTimeOffset finPeriode,
        DateTimeOffset debut,
        int duree)
    {
        var fin = debut.AddMinutes(duree);
        if (debut < debutPeriode || fin > finPeriode)
        {
            throw new DomainException("Le créneau confirmé doit être inclus dans la période souhaitée.");
        }
    }
}
