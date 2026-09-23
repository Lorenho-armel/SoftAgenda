using AutoMapper;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Demandes;

namespace GestionAgenda.Application.Mappings;

public sealed class PlanificationProfile : Profile
{
    public PlanificationProfile()
    {
        CreateMap<ConflitPlanification, ConflitPlanificationResponse>();
        CreateMap<BilanPlanification, BilanPlanificationResponse>();
    }
}
