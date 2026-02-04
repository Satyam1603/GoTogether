using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehicleService.Data;
using VehicleService.Models;

/*[
  {
    "vehicle_Id": 1,
    "driverId": 1,
    "make": "Honda",
    "model": "City",
    "plateNumber": "MH-12-AB-1234",
    "color": "White",
    "capacity": 4
  }
]*/
namespace VehicleService.Controllers
{
    [Route("gotogether/[controller]")] // URL: http://localhost:5000/gotogether/vehicle
    [ApiController]
    [EnableCors]
    public class VehicleController : ControllerBase
    {
        private readonly VehicleDbContext _context;

        public VehicleController(VehicleDbContext context)
        {
            _context = context; 
        }

        //Get all vehicles for a specific driver
        //GET /gotogether/vehicle/driver/{driverId}
        [HttpGet("driver/{driverId}")]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehiclesByDriver(long driverId)
        {
            return await _context.Vehicles.Where(v=> v.DriverId ==  driverId).ToListAsync();
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehicles()
        {
            return await _context.Vehicles.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehiclesById(long id)
        {
            return await _context.Vehicles.Where(v => v.Vehicle_Id == id).ToListAsync();
        }

        [HttpPost]  
        public async Task<ActionResult<Vehicle>> AddVehicle(Vehicle vehicle)
        {
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(AddVehicle), vehicle);
        }

        [HttpDelete("{id}")] //gotogether/vehicle/{id}
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
            {
                return NotFound();
            }

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}")] //gotogether/vehicle/{id}
        public async Task<IActionResult> UpdateVehicle(int id, Vehicle vehicle)
        {
            if(id != vehicle.Vehicle_Id)
            {
                return BadRequest($"Mismatch! URL ID: {id}, Body ID: {vehicle.Vehicle_Id}");
            }

            var existingVehicle = await _context.Vehicles.FindAsync(id);
            if (existingVehicle == null) 
            {
                return NotFound();            
            }

            existingVehicle.Make = vehicle.Make;
            existingVehicle.Model = vehicle.Model;
            existingVehicle.PlateNumber = vehicle.PlateNumber;
            existingVehicle.Color = vehicle.Color;
            existingVehicle.Capacity = vehicle.Capacity;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if(!_context.Vehicles.Any(e=> e.Vehicle_Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return NoContent(); //204, std for Updates.

        }
    }
}
