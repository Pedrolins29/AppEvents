using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppEvents.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDressCodeAndTimeline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DressCode",
                table: "Events",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TimelineItems",
                table: "Events",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'::jsonb");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DressCode",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "TimelineItems",
                table: "Events");
        }
    }
}
