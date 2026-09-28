namespace GestionAgenda.Domain.Demandes;

public sealed record DirigeantGere(Guid DirigeantId, string DirigeantNom, Guid SocieteId, string SocieteNom);
