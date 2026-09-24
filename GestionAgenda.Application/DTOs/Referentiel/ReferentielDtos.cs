namespace GestionAgenda.Application.DTOs.Referentiel;

public sealed record PersonneSocieteResponse(Guid Id, string NomComplet, string Email);

public sealed record SalleOptionResponse(Guid Id, string Nom, int Capacite);

public sealed record SocieteDetailResponse(
    Guid Id,
    string Nom,
    IReadOnlyList<PersonneSocieteResponse> Dirigeants,
    IReadOnlyList<PersonneSocieteResponse> Membres,
    IReadOnlyList<SalleOptionResponse> Salles);
