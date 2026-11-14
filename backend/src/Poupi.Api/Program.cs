using System.Security.Claims;
using System.Text;
using Poupi.Api.Middleware;
using Poupi.Api.Security;
using Poupi.Application.Common;
using Poupi.Application.Interfaces;
using Poupi.Application.Services;
using Poupi.Infrastructure.Email;
using Poupi.Domain.Repositories;
using Poupi.Infrastructure.Persistence;
using Poupi.Infrastructure.Repositories;
using Poupi.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.AddControllers();

builder.Services.AddPoupiRateLimiting();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<IHouseholdRepository, HouseholdRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICardRepository, CardRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IPasswordSetupTokenRepository, PasswordSetupTokenRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IMemberInviteService, MemberInviteService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IHouseholdService, HouseholdService>();
builder.Services.AddScoped<IPlatformService, PlatformService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICardService, CardService>();
builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IQuickEntryService, QuickEntryService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

builder.Services.AddSingleton(
    builder.Configuration.GetSection(InviteOptions.SectionName).Get<InviteOptions>()
        ?? new InviteOptions());

builder.Services.AddSingleton(
    builder.Configuration.GetSection(RefreshTokenOptions.SectionName).Get<RefreshTokenOptions>()
        ?? new RefreshTokenOptions());

builder.Services.AddSingleton(
    builder.Configuration.GetSection(PlatformOptions.SectionName).Get<PlatformOptions>()
        ?? new PlatformOptions());

builder.Services.Configure<BrevoOptions>(
    builder.Configuration.GetSection(BrevoOptions.SectionName));
var brevo = builder.Configuration.GetSection(BrevoOptions.SectionName).Get<BrevoOptions>()
    ?? new BrevoOptions();

builder.Services.Configure<SmtpOptions>(
    builder.Configuration.GetSection(SmtpOptions.SectionName));
var smtp = builder.Configuration.GetSection(SmtpOptions.SectionName).Get<SmtpOptions>()
    ?? new SmtpOptions();

if (brevo.IsConfigured)
{
    builder.Services.AddHttpClient<IEmailSender, BrevoEmailSender>(client =>
        client.Timeout = TimeSpan.FromSeconds(20));
}
else if (smtp.IsConfigured)
{
    builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
}
else if (builder.Environment.IsProduction())
{
    throw new InvalidOperationException(smtp.IsMissingPassword
        ? "Smtp:User está definido mas Smtp:Password está vazio, então o servidor "
          + "recusaria a autenticação. Defina a senha com 'dotnet user-secrets set "
          + "\"Smtp:Password\" \"<senha>\"' ou na variável Smtp__Password."
        : "Nenhum provedor de e-mail configurado. Defina Brevo:ApiKey e Brevo:FromEmail "
          + "(recomendado em produção, porque hospedagens gratuitas costumam bloquear as "
          + "portas de SMTP) ou Smtp:Host e Smtp:FromEmail. Em produção os convites não "
          + "podem cair no log.");
}
else
{
    if (smtp.IsMissingPassword)
    {
        Console.WriteLine(
            "AVISO: Smtp:User está definido mas Smtp:Password está vazio. Os convites "
            + "vão para o log em vez do e-mail. Defina a senha com 'dotnet user-secrets "
            + "set \"Smtp:Password\" \"<senha de app>\"'.");
    }
    builder.Services.AddScoped<IEmailSender, LogEmailSender>();
}

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? new JwtOptions();

if (Encoding.UTF8.GetByteCount(jwt.Key) < 32)
{
    throw new InvalidOperationException(
        "Jwt:Key ausente ou muito curta (mínimo 32 bytes). A chave nunca fica em arquivo " +
        "versionado: defina com 'dotnet user-secrets set \"Jwt:Key\" \"<32+ bytes>\"' ou na " +
        "variável de ambiente Jwt__Key.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var principal = context.Principal!;
                var valid =
                    Guid.TryParse(
                        principal.FindFirstValue(ClaimTypes.NameIdentifier)
                            ?? principal.FindFirstValue("sub"),
                        out var userId)
                    && Guid.TryParse(principal.FindFirstValue(AppClaims.Household), out var householdId)
                    && await context.HttpContext.RequestServices
                        .GetRequiredService<IAuthService>()
                        .IsSessionValidAsync(
                            userId,
                            householdId,
                            principal.IsInRole("Admin"),
                            principal.IsInRole(AppClaims.DeveloperRole),
                            context.HttpContext.RequestAborted);
                if (!valid)
                {
                    context.Fail("Sessão inválida.");
                }
            },
        };
    });
builder.Services.AddAuthorization();

const string FrontendCors = "Frontend";
string[] devOrigins = ["http://localhost:5173", "capacitor://localhost", "http://localhost", "https://localfinance.pages.dev", "https://poupi.pages.dev"];
var configuredOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
var allowedOrigins = devOrigins.Concat(configuredOrigins)
    .Select(o => o.TrimEnd('/'))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

builder.Services.AddCors(options =>
    options.AddPolicy(FrontendCors, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Poupi API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Cole o token JWT obtido em /api/auth/login.",
    });
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer", document), [] },
    });
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseRateLimiter();

using (var scope = app.Services.CreateScope())
{
    await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .AllowAnonymous();

app.UseCors(FrontendCors);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
