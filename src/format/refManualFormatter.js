/**
 * Formats a parsed system as a line in the Ref Manual block.
 * Adds headers for each new subsector group based on index.
 * @param {object} data - Parsed system data from readLine
 * @returns {string}
 */
export function formatAsRefManual(data) {
    // Header for each new subsector block (caller ensures grouping)
    let output = '';

    if (!data._subsectorStarted) {
        output += (
            `#!;${data.subsectorIndex} - ${data.subsector}\r\n` +
            `##;${data.subsectorIndex} - ${data.subsector}\r\n` +
            `#wb;singletext\r\n` +
            `#ts;\r\n` +
            `#th;Name;Location;Bases;2:Statistics;Trade Codes;Travel Code;2:Allegiance;Gas Giants\r\n`
        );
        data._subsectorStarted = true;
    }

    output += `#tr;${data.name};${data.hex};${data.bases};2:${data.uwp};${data.tradeCodes};1:${data.zone};2:${data.allegiance};1:${data.gasGiant}\r\n`;

    return output;
}