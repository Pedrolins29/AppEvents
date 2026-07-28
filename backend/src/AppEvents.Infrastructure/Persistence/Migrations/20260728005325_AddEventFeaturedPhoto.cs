using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppEvents.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEventFeaturedPhoto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FeaturedPhotoUrl",
                table: "Events",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FeaturedPhotoUrl",
                table: "Events");
        }
    }
}
