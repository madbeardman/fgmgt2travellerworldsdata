/**
 * Formats a parsed system into plain text format for use in `.txt` output.
 * Each field is prefixed and line-delimited.
 * @param {object} data - Parsed system data from readLine
 * @returns {string}
 */
export function formatAsSystem(data) {
    return (
        `name|${data.name}\r\n` +
        `sector|${data.sector}\r\n` +
        `subsector|${data.subsector}\r\n` +
        `hex_code|${data.hex}\r\n` +
        `uwp|${data.uwp}\r\n` +
        `bases|${data.bases}\r\n` +
        `trade_codes|${data.tradeCodes}\r\n` +
        `travel_code|${data.zone}\r\n` +
        `allegiance|${data.allegiance}\r\n` +
        `system|${data.gasGiant}\r\n` +
        `starport_quality|${data.starport}\r\n` +
        `starport_quality_text|${data.starportText}\r\n` +
        `size|${data.size}\r\n` +
        `size_text|${data.sizeText}\r\n` +
        `atmosphere_type|${data.atmosphere}\r\n` +
        `atmosphere_type_text|${data.atmosphereText}\r\n` +
        `hydrographics|${data.hydro}\r\n` +
        `hydrographics_text|${data.hydroText}\r\n` +
        `population|${data.population}\r\n` +
        `population_text|${data.populationText}\r\n` +
        `government_type|${data.government}\r\n` +
        `government_type_text|${data.governmentText}\r\n` +
        `law_level|${data.law}\r\n` +
        `law_level_text|${data.lawText}\r\n` +
        `tech_level|${data.tech}\r\n` +
        `tech_level_text|${data.techText}\r\n` +
        `\r\n`
    );
}