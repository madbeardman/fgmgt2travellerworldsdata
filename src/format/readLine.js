import {
    TRADE_CODES,
    STARPORT_QUALITY,
    SIZE,
    ATMOSPHERE_TYPE,
    HYDROGRAPHICS,
    POPULATION,
    GOVERNMENT_TYPE,
    LAW_LEVEL
} from '../utils/lookup.js';

import { ALLEGIANCES } from '../utils/allegiances.js';
import { formatAsRefManual } from './refManualFormatter.js';
import { formatAsSystem } from './systemFormatter.js';
import { formatAsXml } from './xmlFormatter.js';

/**
 * Parses a line of T5-style system data and returns formatted output.
 * Delegates to the appropriate formatter based on context.buildType.
 */
export async function readLine(sector, subsector, systemLine, subsectorIndex, context) {
    const name = systemLine.substring(0, 13).trim();
    const hex = systemLine.substring(14, 18).trim();
    const uwp = systemLine.substring(19, 28).trim();
    let bases = systemLine.substring(30, 31).trim();
    const comments = systemLine.substring(32, 47).trim();
    const zone = systemLine.substring(48, 49).trim();
    const pbg = systemLine.substring(51, 54).trim();
    const allegianceCode = systemLine.substring(55, 57).trim();
    const stellar = systemLine.substring(58, 73).trim();

    const gasGiants = parseInt(pbg.substring(2, 3));
    const gasGiant = gasGiants > 0 ? 'G' : '';

    // Decode allegiance and trade codes
    const allegiance = ALLEGIANCES[allegianceCode] || '';
    const tradeCodes = comments.split(' ').filter(code => TRADE_CODES[code]).join(' ');

    // Decode UWP fields
    const starport = uwp.charAt(0);
    const size = uwp.charAt(1);
    const atmo = uwp.charAt(2);
    const hydro = uwp.charAt(3);
    const pop = uwp.charAt(4);
    const gov = uwp.charAt(5);
    const law = uwp.charAt(6);
    const tech = uwp.charAt(8);

    const decoded = {
        name: /^[0-9]/.test(name) ? `_${name}` : name,
        sector,
        subsector,
        hex,
        uwp,
        bases: mapBases(bases, comments),
        tradeCodes,
        zone,
        allegiance,
        gasGiant,
        starport,
        starportText: STARPORT_QUALITY[starport] || '',
        size,
        sizeText: SIZE[size] || '',
        atmosphere: atmo,
        atmosphereText: ATMOSPHERE_TYPE[atmo] || '',
        hydro,
        hydroText: HYDROGRAPHICS[hydro] || '',
        population: pop,
        populationText: POPULATION[pop] || '',
        government: gov,
        governmentText: GOVERNMENT_TYPE[gov] || '',
        law,
        lawText: (LAW_LEVEL[law] || '').replace('&', '&amp;'),
        tech,
        techText: `Tech Level: ${parseInt(tech, 16)}`,
        nodeName: `id-${String(context.nodeNumber++).padStart(5, '0')}`,
        subsectorIndex
    };

    switch (context.buildType) {
        case 'module':
            return formatAsXml(decoded);
        case 'system':
            return formatAsSystem(decoded);
        default:
            return formatAsRefManual(decoded);
    }
}

/**
 * Maps base codes and special cases like RsE.
 */
function mapBases(bases, commentField) {
    if (bases === 'A') return 'N S';
    if (bases === 'F') return 'Z M';

    let result = bases;
    if (commentField.includes('RsE')) {
        result = result.trim() + ' RS';
    }
    return result.trim();
}