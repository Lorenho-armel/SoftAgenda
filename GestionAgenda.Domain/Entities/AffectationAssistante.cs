using GestionAgenda.Domain.Common;

namespace GestionAgenda.Domain.Entities;

public sealed class AffectationAssistante : BaseEntity
{
    private AffectationAssistante()
    {
    }

    public Guid AssistanteId { get; private set; }

    public Guid DirigeantId { get; private set; }

    public Guid SocieteId { get; private set; }

    public bool EstActive { get; private set; }

    public Utilisateur? Assistante { get; private set; }

    public Utilisateur? Dirigeant { get; private set; }

    public static AffectationAssistante Creer(Guid assistanteId, Guid dirigeantId, Guid societeId) =>
        new()
        {
            AssistanteId = assistanteId,
            DirigeantId = dirigeantId,
            SocieteId = societeId,
            EstActive = true,
        };
}
