using System.Text.Json;
using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.DemandesRencontre;
using GestionAgenda.Domain.Exceptions;

namespace GestionAgenda.API.Middleware;

public sealed class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            await EcrireAsync(context, exception);
        }
    }

    private async Task EcrireAsync(HttpContext context, Exception exception)
    {
        if (context.Response.HasStarted)
        {
            System.Runtime.ExceptionServices.ExceptionDispatchInfo.Capture(exception).Throw();
        }

        if (exception is ConflictException conflit)
        {
            JournaliserRefus(context, conflit.Message);
            await EcrireConflitAsync(context, conflit);
            return;
        }

        var (status, message) = exception switch
        {
            NotFoundException ex => (StatusCodes.Status404NotFound, ex.Message),
            UnauthorizedException ex => (StatusCodes.Status401Unauthorized, ex.Message),
            ForbiddenException ex => (StatusCodes.Status403Forbidden, ex.Message),
            DomainException ex => (StatusCodes.Status400BadRequest, ex.Message),
            _ => (StatusCodes.Status500InternalServerError, "Une erreur interne est survenue."),
        };

        if (status == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Erreur non gérée sur {Method} {Path}", context.Request.Method, context.Request.Path);
        }
        else
        {
            JournaliserRefus(context, message);
        }

        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(ApiResponse<object>.Fail(message), JsonOptions));
    }

    private void JournaliserRefus(HttpContext context, string message) =>
        logger.LogWarning(
            "Requête refusée {Method} {Path} : {Message}",
            context.Request.Method,
            context.Request.Path,
            message);

    private static Task EcrireConflitAsync(HttpContext context, ConflictException conflit)
    {
        var conflits = conflit.Conflits.Select(item => new ConflitPlanificationResponse(
            item.Nature,
            item.Bloquant,
            item.Message,
            item.OccurrenceId,
            item.Titre,
            item.Debut,
            item.Fin,
            item.ParticipantId,
            item.ParticipantNom,
            item.SalleId,
            item.SalleNom)).ToList();
        context.Response.StatusCode = StatusCodes.Status409Conflict;
        context.Response.ContentType = "application/json";
        var payload = ApiResponse<IReadOnlyList<ConflitPlanificationResponse>>.Fail(conflit.Message, conflits);
        return context.Response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
    }
}
