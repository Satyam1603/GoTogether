using System.ComponentModel.DataAnnotations;

namespace VehicleService.Models
{
    public class Vehicle
    {
        [Key]
        public int Vehicle_Id { get; set; }
        public long DriverId { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string PlateNumber { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public int Capacity { get; set; }
    }
}