namespace GestionAgenda.Application.DTOs;

public record ApiResponse<T>(bool Success, string? Message, T? Data, DateTimeOffset Timestamp)
{
    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new(true, message, data, DateTimeOffset.UtcNow);

    public static ApiResponse<T> Fail(string message, T? data = default) =>
        new(false, message, data, DateTimeOffset.UtcNow);
}
