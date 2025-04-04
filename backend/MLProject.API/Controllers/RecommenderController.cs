using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using CsvHelper;
using CsvHelper.Configuration;

namespace MLProject.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecommenderController : ControllerBase
    {
        [HttpGet("contentRecommendation/{contentId}")]
        public IActionResult GetContentRecommendation(string contentId)
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "content_filtering_results.csv");

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("CSV file not found.");
            }

            using var reader = new StreamReader(filePath);
            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true
            });

            var records = csv.GetRecords<dynamic>().ToList();

            // Match by string value
            var matchingRow = records.FirstOrDefault(r =>
                ((IDictionary<string, object>)r)["contentId"]?.ToString() == contentId);

            if (matchingRow == null)
            {
                return NotFound("Content ID not found.");
            }

            var rowDict = (IDictionary<string, object>)matchingRow;

            var topRecommendations = rowDict
                .Where(kv => kv.Key != "contentId")
                .Select(kv => new
                {
                    Name = kv.Key,
                    Value = double.TryParse(kv.Value?.ToString(), out var val) ? val : double.MinValue
                })
                .OrderByDescending(x => x.Value)
                .Skip(1)
                .Take(5)
                .Select(x => x.Name)
                .ToList();

            return Ok(topRecommendations);
        }

        [HttpGet("collabRecommendation/{contentId}")]
        public IActionResult GetCollaborativeRecommendation(string contentId)
        {
            var _csvFilePath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "collab_recommendations.csv");
            if (!System.IO.File.Exists(_csvFilePath))
            {
                return NotFound("Recommendation CSV file not found.");
            }

            using var reader = new StreamReader(_csvFilePath);
            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true
            });

            var records = csv.GetRecords<dynamic>().ToList();

            // Find the row where ContentId matches
            var matchingRow = records.FirstOrDefault(r =>
                ((IDictionary<string, object>)r)["If you liked"]?.ToString() == contentId);

            if (matchingRow == null)
            {
                return NotFound("Content ID not found.");
            }

            var rowDict = (IDictionary<string, object>)matchingRow;

            // Get the top 5 recommendations
            var recommendations = rowDict
                .Where(kv => kv.Key.StartsWith("Recommendation"))  // Select only recommendation columns
                .OrderBy(kv => kv.Key)  // Ensure the order is correct
                .Select(kv => kv.Value?.ToString())
                .Where(val => !string.IsNullOrEmpty(val)) // Remove any null or empty values
                .ToList();

            return Ok(recommendations);
        }

    }
}
