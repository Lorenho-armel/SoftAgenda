using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using GestionAgenda.API;
using GestionAgenda.API.Middleware;
using GestionAgenda.API.Services;
using GestionAgenda.Application.Services.Interfaces;
using GestionAgenda.Infrastructure;
using GestionAgenda.Infrastructure.Migrations;
using GestionAgenda.Infrastructure.Notifications;
using GestionAgenda.Infrastructure.Seeding;
using Hangfire;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy =>
{
    var origins = OriginesCors.Lire(builder.Configuration);
    if (origins.Length == 0)
    {
        policy.SetIsOriginAllowed(_ => false);
        return;
    }

    policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
}));
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "inconnu",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    await using var scope = app.Services.CreateAsyncScope();
    var generateur = scope.ServiceProvider.GetRequiredService<GenerateurScriptsMigration>();
    await generateur.EcrireAsync();
    var seeder = scope.ServiceProvider.GetRequiredService<DevDataSeeder>();
    await seeder.SeedAsync();
}

app.UseMiddleware<ExceptionMiddleware>();
if (!app.Environment.IsDevelopment() && !app.Environment.IsEnvironment("Testing"))
{
    app.UseHsts();
}

if (!app.Environment.IsEnvironment("Testing"))
{
    app.UseHttpsRedirection();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapHub<NotificationsHub>("/hubs/notifications");
app.MapControllers();
PlanifierRappels(app);
ControleConfigurationNotifications.Journaliser(app.Configuration, app.Logger);
app.Run();

static void PlanifierRappels(WebApplication app)
{
    if (!app.Configuration.GetValue("Hangfire:Actif", true))
    {
        return;
    }

    try
    {
        RecurringJob.AddOrUpdate<RappelsRencontre>(
            "rappels-rencontres",
            service => service.ExecuterAsync(),
            "*/15 * * * *");
    }
    catch (Exception exception)
    {
        app.Logger.LogError(exception, "Les rappels de rencontre n'ont pas pu être planifiés.");
    }
}

public partial class Program;
