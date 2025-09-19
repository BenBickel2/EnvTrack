import fs from 'fs';
import path from 'path';

const inputPath = path.join(__dirname, '../public/boston_boundary.json');
const outputPath = path.join(__dirname, '../public/neighborhoods.json');

try {
    // Read the original GeoJSON
    const originalData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    // Transform the data
    const neighborhoods = {
        type: "FeatureCollection",
        features: originalData.features.map((feature: any) => ({
            type: "Feature",
            properties: {
                name: feature.properties.Name || feature.properties.name || 'Unknown',
                // Add any other properties you want to keep
            },
            geometry: feature.geometry
        }))
    };

    // Write the new file
    fs.writeFileSync(
        outputPath,
        JSON.stringify(neighborhoods, null, 2)
    );

    console.log('Conversion complete! Check neighborhoods.json');
} catch (error) {
    console.error('Error converting file:', error);
}