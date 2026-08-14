using System.Text;
using LocalFinance.Api.Middleware;
using LocalFinance.Application.Common;
using LocalFinance.Application.Interfaces;
using LocalFinance.Application.Services;
using LocalFinance.Infrastructure.Email;
using LocalFinance.Domain.Repositories;
using LocalFinance.Infrastructure.Persistence;
using LocalFinance.Infrastructure.Repositories;
using LocalFinance.Infrastructure.Security;
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

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IPasswordSetupTokenRepository, PasswordSetupTokenRepository>();
builder.Services.AddScoped<IMemberInviteService, MemberInviteService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

builder.Services.AddSingleton(
    builder.Configuration.GetSection(InviteOptions.SectionName).Get<InviteOptions>()
        ?? new InviteOptions());

builder.Services.Configure<SmtpOptions>(
    builder.Configuration.GetSection(SmtpOptions.SectionName));
var smtp = builder.Configuration.GetSection(SmtpOptions.SectionName).Get<SmtpOptions>()
    ?? new SmtpOptions();
if (smtp.IsConfigured)
{
    builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
}
else if (builder.Environment.IsProduction())
{
    throw new InvalidOperationException(smtp.IsMissingPassword
        ? "Smtp:User está definido mas Smtp:Password está vazio, então o servidor "
          + "recusaria a autenticação. Defina a senha com 'dotnet user-secrets set "
          + "\"Smtp:Password\" \"<senha>\"' ou na variável Smtp__Password."
        : "SMTP não configurado. Defina Smtp:Host e Smtp:FromEmail. Em produção os "
          + "convites não podem cair no log.");
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
    });
builder.Services.AddAuthorization();

const string FrontendCors = "Frontend";
string[] devOrigins = ["http://localhost:5173", "capacitor://localhost", "http://localhost", "https://localfinance.pages.dev"];
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
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "LocalFinance API", Version = "v1" });
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

app.UseMiddleware<ExceptionHandlingMiddleware>();

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
