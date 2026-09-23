using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Enums;

namespace GestionAgenda.Application.DTOs.TableauAssistante;

public sealed record TableauAssistanteQuery(DateTimeOffset DebutJour, DateTimeOffset FinJour);

public sealed record CompteursTableauResponse(
    int ATraiter,
    int Urgentes,
    int Critiques,
    int Prioritaires,
    int Acceptees,
    int Reportees,
    int PlanifieesAujourdhui);

public sealed record RencontreTableauResponse(
    Guid DemandeId,
    string Motif,
    Urgence Urgence,
    Priorite Priorite,
    DateTimeOffset Debut,
    DateTimeOffset Fin,
    string DirigeantNom,
    string SocieteNom);

public sealed record TableauAssistanteResponse(
    CompteursTableauResponse Compteurs,
    IReadOnlyList<DemandeRencontreResumeResponse> ATraiterMaintenant,
    IReadOnlyList<RencontreTableauResponse> RencontresAujourdhui,
    IReadOnlyList<RencontreTableauResponse> ProchainesRencontres);
