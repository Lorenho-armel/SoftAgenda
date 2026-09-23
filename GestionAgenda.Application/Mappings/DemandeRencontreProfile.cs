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
        CreateMap<DemandeRencontre, DemandeRencontreResumeResponse>();
        CreateMap<DemandeRencontre, DemandeRencontreResponse>()
            .ForMember(
                destination => destination.RendezVousId,
                option => option.MapFrom(source => source.RendezVous == null ? (Guid?)null : source.RendezVous.Id))
            .ForMember(
                destination => destination.ReunionId,
                option => option.MapFrom(source => source.Reunion == null ? (Guid?)null : source.Reunion.Id))
            .ForMember(
                destination => destination.Historique,
                option => option.MapFrom(source => source.Historique.OrderBy(item => item.DateCreation)));
    }
}
