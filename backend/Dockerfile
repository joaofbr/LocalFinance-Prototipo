FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY LocalFinance.slnx ./
COPY src/LocalFinance.Domain/LocalFinance.Domain.csproj src/LocalFinance.Domain/
COPY src/LocalFinance.Application/LocalFinance.Application.csproj src/LocalFinance.Application/
COPY src/LocalFinance.Infrastructure/LocalFinance.Infrastructure.csproj src/LocalFinance.Infrastructure/
COPY src/LocalFinance.Api/LocalFinance.Api.csproj src/LocalFinance.Api/
RUN dotnet restore src/LocalFinance.Api/LocalFinance.Api.csproj

COPY . .
RUN dotnet publish src/LocalFinance.Api/LocalFinance.Api.csproj \
    -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=8080
EXPOSE 8080

USER $APP_UID

ENTRYPOINT ["dotnet", "LocalFinance.Api.dll"]
