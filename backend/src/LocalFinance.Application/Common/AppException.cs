namespace LocalFinance.Application.Common;

public abstract class AppException(int statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public sealed class ValidationException(string message) : AppException(400, message);

public sealed class UnauthorizedException(string message) : AppException(401, message);

public sealed class NotFoundException(string message) : AppException(404, message);

public sealed class ConflictException(string message) : AppException(409, message);

public sealed class EmailException(string message) : AppException(502, message);
