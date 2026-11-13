using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Poupi.Infrastructure.Persistence.Migrations
{
    public partial class RefreshPalette : Migration
    {
        private static readonly (string Name, string Old, string New)[] Categories =
        [
            ("Mercado", "#f59e0b", "#d95926"),
            ("Moradia", "#6366f1", "#3987e5"),
            ("Transporte", "#0ea5e9", "#199e70"),
            ("Alimentação", "#f97316", "#c98500"),
            ("Saúde", "#f43f5e", "#e66767"),
            ("Educação", "#8b5cf6", "#9085e9"),
            ("Lazer", "#ec4899", "#d55181"),
            ("Contas & Serviços", "#14b8a6", "#008300"),
            ("Salário", "#059669", "#008300"),
            ("Renda extra", "#22c55e", "#199e70"),
            ("Investimentos", "#84cc16", "#3987e5"),
        ];

        private static readonly (string Old, string New)[] Avatars =
        [
            ("#059669", "#3987e5"),
            ("#6366f1", "#d95926"),
            ("#f97316", "#199e70"),
            ("#0ea5e9", "#d55181"),
            ("#ec4899", "#9085e9"),
            ("#8b5cf6", "#c98500"),
        ];

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            foreach (var (name, from, to) in Categories)
            {
                RecolorCategory(migrationBuilder, name, from, to);
            }
            RecolorUsers(migrationBuilder, Avatars.Select(a => (a.Old, a.New)));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            foreach (var (name, from, to) in Categories)
            {
                RecolorCategory(migrationBuilder, name, to, from);
            }
            RecolorUsers(migrationBuilder, Avatars.Select(a => (a.New, a.Old)));
        }

        private static void RecolorCategory(
            MigrationBuilder migrationBuilder, string name, string from, string to) =>
            migrationBuilder.Sql(
                $"UPDATE \"Categories\" SET \"Color\" = '{to}' "
                + $"WHERE \"Name\" = '{name}' AND lower(\"Color\") = '{from}';");

        private static void RecolorUsers(
            MigrationBuilder migrationBuilder, IEnumerable<(string From, string To)> mapping)
        {
            var cases = string.Join(" ", mapping.Select(m => $"WHEN '{m.From}' THEN '{m.To}'"));
            var froms = string.Join(", ", mapping.Select(m => $"'{m.From}'"));
            migrationBuilder.Sql(
                $"UPDATE \"Users\" SET \"Color\" = CASE lower(\"Color\") {cases} END "
                + $"WHERE lower(\"Color\") IN ({froms});");
        }
    }
}
