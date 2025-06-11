export function createXMLDefinitionFileContent(sector) {
    return (
        `<?xml version="1.0" encoding="iso-8859-1"?>\r\n` +
        `<root version="3.3" release="1|CoreRPG:4">\r\n` +
        `  <name>${sector} Systems Data</name>\r\n` +
        `  <category></category>\r\n` +
        `  <author>Sector System Data</author>\r\n` +
        `  <ruleset>MGT2</ruleset>\r\n` +
        `</root>`
    );
}

export function createXMLDDBFileHeader(sector) {
    const name = sector.replace(/\s/g, '').toLowerCase() + 'worldsdata';

    return (
        `<?xml version="1.0" encoding="iso-8859-1"?>\r\n` +
        `<root version="3.3" release="1|CoreRPG:4">\r\n` +
        `  <library>\r\n` +
        `    <worldsdata static="true">\r\n` +
        `      <categoryname type="string"></categoryname>\r\n` +
        `      <name type="string">${name}</name>\r\n` +
        `      <entries>\r\n` +
        `        <worlds>\r\n` +
        `          <librarylink type="windowreference">\r\n` +
        `            <class>reference_list</class>\r\n` +
        `            <recordname>..</recordname>\r\n` +
        `          </librarylink>\r\n` +
        `          <name type="string">Worlds</name>\r\n` +
        `          <recordtype type="string">worlds</recordtype>\r\n` +
        `        </worlds>\r\n` +
        `      </entries>\r\n` +
        `    </worldsdata>\r\n` +
        `  </library>\r\n` +
        `  <worlds>\r\n` +
        `    <category name="" baseicon="0" decalicon="0">\r\n`
    );
}

export function createXMLDDBFileFooter() {
    return (
        `    </category>\r\n` +
        `  </worlds>\r\n` +
        `</root>\r\n`
    );
}