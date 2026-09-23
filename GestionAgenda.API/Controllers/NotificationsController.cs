using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.Notifications;
using GestionAgenda.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionAgenda.API.Controllers;

[ApiController]
[Authorize(Roles = "Dirigeant,Assistante,Collaborateur,Externe")]
[Route("api/notifications")]
[Produces("application/json")]
public sealed class NotificationsController(ICentreNotifications centre, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResult<NotificationResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] NotificationQuery query, CancellationToken cancellationToken)
    {
        var result = await centre.ListerAsync(currentUser.UserId, query, cancellationToken);
        return Ok(ApiResponse<PaginatedResult<NotificationResponse>>.Ok(result));
    }

    [HttpGet("push/cle")]
    [ProducesResponseType(typeof(ApiResponse<ClePushResponse>), StatusCodes.Status200OK)]
    public IActionResult ClePush()
    {
        var cle = new ClePushResponse(centre.ClePubliquePush());
        return Ok(ApiResponse<ClePushResponse>.Ok(cle));
    }

    [HttpPost("push")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Abonner(AbonnementPushRequest request, CancellationToken cancellationToken)
    {
        await centre.EnregistrerPushAsync(currentUser.UserId, request, cancellationToken);
        return NoContent();
    }
}
