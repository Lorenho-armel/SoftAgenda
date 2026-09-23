using FluentValidation;
using GestionAgenda.Application.DTOs.Notifications;

namespace GestionAgenda.Application.Validators;

public sealed class NotificationQueryValidator : AbstractValidator<NotificationQuery>
{
    public NotificationQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThan(0);
        RuleFor(x => x.Size).InclusiveBetween(1, 50);
    }
}

public sealed class AbonnementPushRequestValidator : AbstractValidator<AbonnementPushRequest>
{
    public AbonnementPushRequestValidator()
    {
        RuleFor(x => x.Endpoint).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.CleP256dh).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Auth).NotEmpty().MaximumLength(200);
    }
}
