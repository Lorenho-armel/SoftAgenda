using GestionAgenda.Domain.Common;
using GestionAgenda.Domain.Entities;

namespace GestionAgenda.Domain.Demandes;

public sealed class ResultatFile
{
    public ResultatFile(
        Page<DemandeRencontre> page,
        CompteursFile compteurs,
        IReadOnlyList<PersonneFile> demandeurs,
        IReadOnlyList<SocieteFile> societes)
    {
        Page = page;
        Compteurs = compteurs;
        Demandeurs = demandeurs;
        Societes = societes;
    }

    public Page<DemandeRencontre> Page { get; }

    public CompteursFile Compteurs { get; }

    public IReadOnlyList<PersonneFile> Demandeurs { get; }

    public IReadOnlyList<SocieteFile> Societes { get; }
}
