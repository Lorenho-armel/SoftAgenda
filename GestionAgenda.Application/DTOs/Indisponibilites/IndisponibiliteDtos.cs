using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.Indisponibilites;

public sealed record CreerIndisponibiliteRequest(
    Guid DirigeantId,
    Guid SocieteId,
    TypeIndisponibilite Type,
    string Motif,
    DateTimeOffset Debut,
    DateTimeOffset Fin);

public sealed record IndisponibiliteResponse(
    Guid Id,
    Guid DirigeantId,
    string DirigeantNom,
    Guid SocieteId,
    TypeIndisponibilite Type,
    string Motif,
    DateTimeOffset Debut,
    DateTimeOffset Fin);

public sealed record DirigeantGereResponse(Guid DirigeantId, string DirigeantNom, Guid SocieteId, string SocieteNom);
