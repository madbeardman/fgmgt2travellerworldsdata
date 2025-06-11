import axios from 'axios';
import { fetchSubsector } from './fetchSubsector.js';

/**
 * Fetches all subsectors for a sector and processes them.
 * @param {string} sectorName - Name of the sector (e.g., "Spinward Marches")
 * @param {object} context - Context object including buildType, output writer, etc.
 */
export async function fetchSector(sectorName, context) {
    const metadataUrl = `https://travellermap.com/api/metadata?sector=${encodeURIComponent(sectorName)}`;

    try {
        const response = await axios.get(metadataUrl);
        const { Subsectors } = response.data;

        for (const { Name, Index } of Subsectors) {
            console.log(`📦 Fetching subsector: ${Name} (${Index})`);
            await fetchSubsector(sectorName, Name, Index, context);
        }
    } catch (err) {
        console.error(`❌ Failed to fetch sector metadata for ${sectorName}: ${err.message}`);
        throw err;
    }
}