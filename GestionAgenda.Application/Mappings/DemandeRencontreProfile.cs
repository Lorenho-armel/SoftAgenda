using AutoMapper;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Entities;

namespace GestionAgenda.Application.Mappings;

public sealed class DemandeRencontreProfile : Profile
{
    public DemandeRencontreProfile()
    {
        CreateMap<DemandeParticipant, ParticipantResponse>();
        CreateMap<HistoriqueDemande, HistoriqueDemandeResponse>();
        // Réponses positionnelles : sans ForCtorParam, AutoMapper aplatit DemandeurNom en Demandeur.Nom.
        CreateMap<DemandeRencontre, DemandeRencontreResumeResponse>()
            .ForCtorParam(
                nameof(DemandeRencontreResumeResponse.DemandeurNom),
                option => option.MapFrom(source =>
                    source.Demandeur == null ? string.Empty : source.Demandeur.Prenom + " " + source.Demandeur.Nom))
            .ForCtorParam(
                nameof(DemandeRencontreResumeResponse.SocieteNom),
                option => option.MapFrom(source => source.Societe == null ? string.Empty : source.Societe.Nom));
        CreateMap<DemandeRencontre, DemandeRencontreResponse>()
            .ForCtorParam(
                nameof(DemandeRencontreResponse.DemandeurNom),
                option => option.MapFrom(source =>
                    source.Demandeur == null ? string.Empty : source.Demandeur.Prenom + " " + source.Demandeur.Nom))
            .ForCtorParam(
                nameof(DemandeRencontreResponse.SocieteNom),
                option => option.MapFrom(source => source.Societe == null ? string.Empty : source.Societe.Nom))
            .ForCtorParam(
                nameof(DemandeRencontreResponse.RendezVousId),
                option => option.MapFrom(source => source.RendezVous == null ? (Guid?)null : source.RendezVous.Id))
            .ForCtorParam(
                nameof(DemandeRencontreResponse.ReunionId),
                option => option.MapFrom(source => source.Reunion == null ? (Guid?)null : source.Reunion.Id))
            .ForCtorParam(
                nameof(DemandeRencontreResponse.Historique),
                option => option.MapFrom(source => source.Historique.OrderBy(item => item.DateCreation)))
            .ForMember(destination => destination.EstGestionnaire, option => option.Ignore());
    }
}
