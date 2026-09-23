using FluentValidation;
using GestionAgenda.Domain.Common;

namespace GestionAgenda.Application.Validators;

public sealed class ParticipantRequestValidator : AbstractValidator<DTOs.DemandesRencontre.ParticipantRequest>
{
    public ParticipantRequestValidator()
    {
        RuleFor(x => x)
            .Must(EstCoherent)
            .WithMessage("Un participant interne a un utilisateur ; un participant externe a un nom et un e-mail.");
        RuleFor(x => x.NomComplet).MaximumLength(LimitesDemande.NomMax);
        RuleFor(x => x.Email)
            .EmailAddress()
            .MaximumLength(LimitesDemande.EmailMax)
            .When(x => !string.IsNullOrWhiteSpace(x.Email));
    }

    private static bool EstCoherent(DTOs.DemandesRencontre.ParticipantRequest participant)
    {
        var externe = !string.IsNullOrWhiteSpace(participant.NomComplet)
            && !string.IsNullOrWhiteSpace(participant.Email);
        var interne = participant.UtilisateurId.HasValue && participant.UtilisateurId != Guid.Empty;
        return interne ^ externe;
    }
}
