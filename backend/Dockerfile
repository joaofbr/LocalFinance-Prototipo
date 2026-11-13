FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Poupi.slnx ./
COPY src/Poupi.Domain/Poupi.Domain.csproj src/Poupi.Domain/
COPY src/Poupi.Application/Poupi.Application.csproj src/Poupi.Application/
COPY src/Poupi.Infrastructure/Poupi.Infrastructure.csproj src/Poupi.Infrastructure/
COPY src/Poupi.Api/Poupi.Api.csproj src/Poupi.Api/
RUN dotnet restore src/Poupi.Api/Poupi.Api.csproj

COPY . .
RUN dotnet publish src/Poupi.Api/Poupi.Api.csproj \
    -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=8080
EXPOSE 8080

USER $APP_UID

ENTRYPOINT ["dotnet", "Poupi.Api.dll"]
