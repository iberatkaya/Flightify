import { writeFileSync } from 'fs';
import { parse } from 'path';

const allAirports = require('./large_airports.json');

interface Airport {
    ident: string;
    type: string;
    name: string;
    elevation_ft: number;
    continent: string;
    iso_country: string;
    iso_region: string;
    municipality: string;
    icao_code: string;
    iata_code: string;
    coordinates: string;
}

const transformedAirports = {};

allAirports.forEach((airport: Airport) => {
    if (!airport.ident) return;

    const [lat, lon] = airport.coordinates.split(',').map(coord => parseFloat(coord.trim()));
    const state = airport.iso_region?.split('-')[1] || '';

    transformedAirports[airport.ident] = {
        icao: airport.icao_code || '',
        iata: airport.iata_code || '',
        name: airport.name || '',
        city: airport.municipality || '',
        state: state,
        country: airport.iso_country || '',
        elevation: airport.elevation_ft || 0,
        lat: lat || 0,
        lon: lon || 0,
        tz: '' // You'll need to add timezone data from another source
    };
});

// Write to a JSON file
writeFileSync('./transformed_airports.json', JSON.stringify(transformedAirports, null, 2));