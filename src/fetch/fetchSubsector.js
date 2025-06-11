import axios from 'axios';
import { readLine } from '../format/readLine.js';

/**
 * Fetches and processes a subsector from the TravellerMap API.
 * @param {string} sector - Name of the sector
 * @param {string} subsector - Name of the subsector
 * @param {string} index - Subsector index (used in formatting)
 * @param {object} context - Context including buildType, writeToFile, etc.
 */
export async function fetchSubsector(sector, subsector, index, context) {
    let url = `https://travellermap.com/data/${encodeURIComponent(sector)}/${encodeURIComponent(subsector)}/sec?header=0&metadata=0`;

    if (process.env.HEXCODE === 'subsector') {
        url += '&sscoords=1';
    }

    try {
        const response = await axios.get(url);
        const rawText = response.data;
        const lines = rawText.split('\r\n').filter(Boolean);

        console.log(`📄 ${lines.length} systems in ${subsector}`);

        for (const line of lines) {
            const output = await readLine(sector, subsector, line, index, context);
            if (output) {
                await context.writeToFile.write(output);
            }
        }
    } catch (err) {
        console.warn(`⚠️ Skipping ${subsector}: ${err.message}`);
    }
}