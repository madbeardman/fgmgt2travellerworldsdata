import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

/**
 * Zips a db.xml and definition.xml file into a Fantasy Grounds .mod file.
 * @param {string} sector - Name of the sector (used in filename)
 * @param {string} xmlPath - Full path to db.xml
 * @param {string} defPath - Full path to definition.xml
 */
export function buildModuleZip(sector, xmlPath, defPath) {
    const zip = new AdmZip();

    zip.addLocalFile(defPath, '', 'definition.xml');
    zip.addLocalFile(xmlPath, '', 'db.xml');

    const outPath = path.resolve(path.dirname(xmlPath), `${sector} Worlds Module.mod`);
    zip.writeZip(outPath);
    console.log(`📦 Created: ${outPath}`);
}