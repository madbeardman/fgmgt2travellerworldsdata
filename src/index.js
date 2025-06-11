import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { fetchSector } from './fetch/fetchSector.js';
import {
    createXMLDefinitionFileContent,
    createXMLDDBFileHeader,
    createXMLDDBFileFooter
} from './utils/xmlTemplates.js';

import { buildModuleZip } from './utils/zip.js';

// Handle CLI input or default values
const sectorName = process.argv[2] || 'Spinward Marches';
const buildType = process.argv[3] || 'module'; // module | system | refmanual

// Setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../output');
const dbXmlPath = path.join(outputDir, 'db.xml');
const defXmlPath = path.join(outputDir, 'definition.xml');
const textFilePath = path.join(outputDir, `${sectorName}.${buildType}.txt`);

// Ensure output dir
await fs.mkdir(outputDir, { recursive: true });

// Create output stream
const writeToFile = await fs.open(buildType === 'module' ? dbXmlPath : textFilePath, 'w');

// Initialise context
const context = {
    buildType,
    writeToFile: writeToFile.createWriteStream(),
    nodeNumber: 1
};

// Write headers for module
if (buildType === 'module') {
    const defXml = createXMLDefinitionFileContent(sectorName);
    const dbHeader = createXMLDDBFileHeader(sectorName);

    await fs.writeFile(defXmlPath, defXml, 'utf-8');
    await context.writeToFile.write(dbHeader);
}

// Fetch and format
await fetchSector(sectorName, context);

// Write footer and zip
if (buildType === 'module') {
    await context.writeToFile.write(createXMLDDBFileFooter());
    context.writeToFile.end();

    buildModuleZip(sectorName, dbXmlPath, defXmlPath);
} else {
    context.writeToFile.end();
}

console.log(`✅ Build complete: ${sectorName} (${buildType})`);