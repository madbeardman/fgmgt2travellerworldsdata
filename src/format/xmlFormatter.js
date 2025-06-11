/**
 * Formats a parsed system as a Fantasy Grounds-compatible XML node.
 * @param {object} data - Parsed system data from readLine
 * @returns {string}
 */
export function formatAsXml(data) {
    return (
        `     <${data.nodeName}>\r\n` +
        `       <sector type="string">${data.sector}</sector>\r\n` +
        `       <subsector type="string">${data.subsector}</subsector>\r\n` +
        `       <atmosphere_type type="string">${data.atmosphere}</atmosphere_type>\r\n` +
        `       <atmosphere_type_text type="string">${data.atmosphereText}</atmosphere_type_text>\r\n` +
        `       <bases type="string">${data.bases}</bases>\r\n` +
        `       <goodslist>\r\n` + // Placeholder – FG expects a node even if empty
        `       </goodslist>\r\n` +
        `       <government_type type="string">${data.government}</government_type>\r\n` +
        `       <government_type_text type="string">${data.governmentText}</government_type_text>\r\n` +
        `       <hexlocation type="string">${data.hex}</hexlocation>\r\n` +
        `       <hydrographics type="string">${data.hydro}</hydrographics>\r\n` +
        `       <hydrographics_text type="string">${data.hydroText}</hydrographics_text>\r\n` +
        `       <law_level type="string">${data.law}</law_level>\r\n` +
        `       <law_level_text type="string">${data.lawText}</law_level_text>\r\n` +
        `       <name type="string">${data.name}</name>\r\n` +
        `       <population type="string">${data.population}</population>\r\n` +
        `       <population_text type="string">${data.populationText}</population_text>\r\n` +
        `       <size type="string">${data.size}</size>\r\n` +
        `       <size_text type="string">${data.sizeText}</size_text>\r\n` +
        `       <starport_quality type="string">${data.starport}</starport_quality>\r\n` +
        `       <starport_quality_text type="string">${data.starportText}</starport_quality_text>\r\n` +
        `       <tech_level type="string">${data.tech}</tech_level>\r\n` +
        `       <tech_level_text type="string">${data.techText}</tech_level_text>\r\n` +
        `       <trade_codes type="string">${data.tradeCodes}</trade_codes>\r\n` +
        `       <travel_code type="string">${data.zone}</travel_code>\r\n` +
        `       <uwp type="string">${data.uwp}</uwp>\r\n` +
        `     </${data.nodeName}>\r\n`
    );
}