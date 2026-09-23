using GestionAgenda.Application.DTOs;
using GestionAgenda.Application.DTOs.TableauAssistante;
using GestionAgenda.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionAgenda.API.Controllers;

[ApiController]
[Authorize(Roles = "Assistante")]
[Route("api/dashboard/assistante")]
[Produces("application/json")]
public sealed class TableauAssistanteController(ITableauAssistanteService service, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<TableauAssistanteResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Get([FromQuery] TableauAssistanteQuery query, CancellationToken cancellationToken)
    {
        var result = await service.ObtenirAsync(currentUser.UserId, query, cancellationToken);
        return Ok(ApiResponse<TableauAssistanteResponse>.Ok(result));
    }
}
