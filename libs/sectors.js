const fs = require('fs');
const request = require('request-promise');
const baseURL = 'https://travellermap.com/data/';
const EasyZip = require('easy-zip2').EasyZip;
let writeToFile;
let bRefManualData = false;
let bWorldData = false;
let bXMLModule = false
let nodeNumber = 1;
let sDefinitionFileName = '';

module.exports = async function fetchSectorWorlds(sSector, sDataFolder, sBuildType) {

    let sFileName = `${sDataFolder}${sSector}`;

    switch (sBuildType) {
      case 'module':
        bXMLModule = true;
        break;
      case 'world':
        bWorldData = true;
        break;
      default:
        bRefManualData = true;
        break;
    }

    if (bXMLModule) {
      sFileName = `${sDataFolder}db.xml`;
      sDefinitionFileName = `${sDataFolder}definition.xml`;
      await createXMLDefinitionFile(sSector, sDefinitionFileName);
    } else if (bWorldData) {
      sFileName = sFileName + ' Worlds.txt'
    } else {
      sFileName = sFileName + ' Ref Manual.txt'
    }

    //Create the stream
    try {
      writeToFile = fs.createWriteStream(sFileName);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }

    if (bXMLModule) {
      await createXMLDDBFile(sSector);
    }

    const options = {
      url: encodeURI(`https://travellermap.com/api/metadata?sector=${sSector}`),
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
      }
    };

    await request(options, async (err, res, body) => {
      if (err) {
        console.log(err);
        return
      }
      let json = JSON.parse(body);

      for (const subsector of json.Subsectors) {
        await fetchsWorldData(sSector, subsector.Name, subsector.Index);
      };

      if (bXMLModule) {
        await createXMLDDBFileEnd();
        await buildZip(sSector, sFileName, sDefinitionFileName);
      }

    });

  }

  async function fetchsWorldData(sSector, sSubSector, sSubSectorIndex)
  {

    const options = {
      url: encodeURI(baseURL + `${sSector}/${sSubSector}/sec?header=0&metadata=0&sscoords=1`),
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
      }
    };

    await request(options, async (err, res, body) => {
      console.log(sSubSector);
      console.log('='.repeat(sSubSector.length));
      let json = JSON.parse(body);

      const text = json.split('\r\n').filter(x => x);

      if (bRefManualData) {
        let worldData =
          '#!;' + sSubSectorIndex + ' - ' + sSubSector + '\r\n' +
          '##;' + sSubSectorIndex + ' - ' + sSubSector + '\r\n' +
          '#wb;singletext\r\n' +
          '#ts;\r\n' +
          '#th;Name;Location;Bases;2:Statistics;Trade Codes;Travel Code;2:Allegiance;Gas Giants\r\n';

          text.sort();

          for (const sWorld of text) {
            worldData = worldData + await readLine(sSector, sSubSector, sWorld);
          }

          worldData = worldData + '#te;\r\n';

          return writeToFile.write(worldData);

      } else {
        for (const sWorld of text) {
          await readLine(sSector, sSubSector, sWorld);
        };
      }

    });
  }

  async function readLine(sSector, sSubsector, sWorldData) {
    const sSectorName = sSector;
    const sSubSectorName = sSubsector;
    let sName = sWorldData.substring(0, 13).trim();
    const sHexNbr = sWorldData.substring(14, 18).trim();
    const sUWP = sWorldData.substring(19, 28).trim();
    const sBases = sWorldData.substring(30, 31).trim();
    const sCodesComments = sWorldData.substring(32, 47).trim();
    const sZone = sWorldData.substring(48, 49).trim();
    const sPBG = sWorldData.substring(51, 54).trim();
    const sAllegiance = sWorldData.substring(55, 57).trim();
    const sStellarData = sWorldData.substring(58, 73).trim();
    const nGasGiants = parseInt(sPBG.substring(2,3));
    let sGasGiant = '';

    console.log(sName);

    if (nGasGiants > 0) {
      sGasGiant = 'G';
    }

    let sAllegianceText = await getAllegiance(sAllegiance);
    if (!sAllegianceText) {
      sAllegianceText = '';
    }

    const aTradeCodes = sCodesComments.split(' ');
    let sTradeCodes = ''

    for (const sTradeCode of aTradeCodes) {
      let validTradeCode = await getTradeCode(sTradeCode);
      if (validTradeCode) {
        sTradeCodes = sTradeCodes + sTradeCode + ' '
      }
    }

    sTradeCodes = sTradeCodes.trim();

    const sStarportQuality = sUWP.substring(0,1);
    const sStarportQualityText = await getStarportQuality(sStarportQuality);
    const sSize = sUWP.substring(1,2);
    const sSizeText = await getSize(sSize);
    const sAtmosphereType = sUWP.substring(2,3);
    const sAtmosphereTypeText = await getAtmosphereType(sAtmosphereType);
    const sHydrographics = sUWP.substring(3,4);
    const sHydrographicsText = await getHydrographics(sHydrographics);
    const sPopulation = sUWP.substring(4,5);
    const sPopulationText = await getPopulation(sPopulation);
    const sGovernmentType = sUWP.substring(5,6);
    const sGovernmentTypeText = await getGovernmentType(sGovernmentType);
    const sLawLevel = sUWP.substring(6,7);
    let sLawLevelText = await getLawLevel(sLawLevel);
    const sTechLevel = sUWP.substring(8,9);
    const sTechLevelText = 'Tech Level: ' + parseInt(sTechLevel,16);

    if (bXMLModule) {

      const nodeName = 'id-' + String(nodeNumber).padStart(5, '0');

      const worldToStore = `     <${nodeName}>\r\n` +
      `       <sector type="string">${sSectorName}</sector>\r\n` +
      `       <subsector type="string">${sSubSectorName}</subsector>\r\n` +
      `       <atmosphere_type type="string">${sAtmosphereType}</atmosphere_type>\r\n` +
      `       <atmosphere_type_text type="string">${sAtmosphereTypeText}</atmosphere_type_text>\r\n` +
      `       <bases type="string">${sBases}</bases>\r\n` +
      `       <goodslist>\r\n` +
      `       </goodslist>\r\n` +
      `       <government_type type="string">${sGovernmentType}</government_type>\r\n` +
      `       <government_type_text type="string">${sGovernmentTypeText}</government_type_text>\r\n` +
      `       <hexlocation type="string">${sHexNbr}</hexlocation>\r\n` +
      `       <hydrographics type="string">${sHydrographics}</hydrographics>\r\n` +
      `       <hydrographics_text type="string">${sHydrographicsText}</hydrographics_text>\r\n` +
      `       <law_level type="string">${sLawLevel}</law_level>\r\n` +
      `       <law_level_text type="string">${sLawLevelText}</law_level_text>\r\n` +
      `       <name type="string">${sName}</name>\r\n` +
      `       <population type="string">${sPopulation}</population>\r\n` +
      `       <population_text type="string">${sPopulationText}</population_text>\r\n` +
      `       <size type="string">${sSize}</size>\r\n` +
      `       <size_text type="string">${sSizeText}</size_text>\r\n` +
      `       <starport_quality type="string">${sStarportQuality}</starport_quality>\r\n` +
      `       <starport_quality_text type="string">${sStarportQualityText}</starport_quality_text>\r\n` +
      `       <tech_level type="string">${sTechLevel}</tech_level>\r\n` +
      `       <tech_level_text type="string">${sTechLevelText}</tech_level_text>\r\n` +
      `       <trade_codes type="string">${sTradeCodes}</trade_codes>\r\n` +
      `       <travel_code type="string">${sZone}</travel_code>\r\n` +
      `       <uwp type="string">${sUWP}</uwp>\r\n` +
      `     </${nodeName}>\r\n`

      nodeNumber++;

      await writeToFile.write(worldToStore);

    }
    else if (bWorldData) {

      if (!isNaN(sName.substring(0,1))) {
        sName = '_' + sName;
      }

      if (sLawLevelText.includes('&')) {
        sLawLevelText = sLawLevelText.replace('&','&amp;');
      }

      const worldToStore =
        'name|' + sName + '\r\n' +
        'sector|' + sSectorName + '\r\n' +
        'subsector|' + sSubSectorName + '\r\n' +
        'hex_code|' + sHexNbr + '\r\n' +
        'uwp|' + sUWP + '\r\n' +
        'bases|' + sBases + '\r\n' +
        'trade_codes|' + sTradeCodes + '\r\n' +
        'travel_code|' + sZone + '\r\n' +
        'allegiance|' + sAllegianceText + '\r\n' +
        'system|' + sGasGiant + '\r\n' +
        'starport_quality|' + sStarportQuality + '\r\n' +
        'starport_quality_text|' + sStarportQualityText + '\r\n' +
        'size|' + sSize + '\r\n' +
        'size_text|' + sSizeText + '\r\n' +
        'atmosphere_type|' + sAtmosphereType + '\r\n' +
        'atmosphere_type_text|' + sAtmosphereTypeText + '\r\n' +
        'hydrographics|' + sHydrographics + '\r\n' +
        'hydrographics_text|' + sHydrographicsText + '\r\n' +
        'population|' + sPopulation + '\r\n' +
        'population_text|' + sPopulationText + '\r\n' +
        'government_type|' + sGovernmentType + '\r\n' +
        'government_type_text|' + sGovernmentTypeText + '\r\n' +
        'law_level|' + sLawLevel + '\r\n' +
        'law_level_text|' + sLawLevelText + '\r\n' +
        'tech_level|' + sTechLevel + '\r\n' +
        'tech_level_text|' + sTechLevelText + '\r\n' +
        '\r\n'

        await writeToFile.write(worldToStore);
    } else {
      console.log(sName);
        return `#tr;${sName};${sHexNbr};${sBases};2:${sUWP};${sTradeCodes};1:${sZone};2:${sAllegianceText};1:${sGasGiant}\r\n`;
    };
  };

  async function getAllegiance(sAllegiance) {

    const aAllegiances = {};

    aAllegiances['As'] = 'Aslan Hierate',
    aAllegiances['At'] = 'Anubian Trade Coalition',
    aAllegiances['Bs'] = 'Belgardian Sojurnate',
    aAllegiances['Cs'] = 'Client State',
    aAllegiances['Dr'] = 'Droyne World',
    aAllegiances['Hv'] = 'Hive Federation',
    aAllegiances['Im'] = 'Imperial',
    aAllegiances['Kk'] = "K'kree Two Thousand Worlds empire",
    aAllegiances['Na'] = '',
    aAllegiances['So'] = 'Solomani Confederation',
    aAllegiances['Zh'] = 'Consulate',
    aAllegiances['Cw'] = 'Chirper World',
    aAllegiances['Dr'] = 'Droyne World',
    aAllegiances['Dd'] = 'Domain of Deneb',
    aAllegiances['Fd'] = 'Federation of Daibei',
    aAllegiances['Fi'] = 'Federation of Ilelish',
    aAllegiances['La'] = 'League of Antares',
    aAllegiances['Li'] = "Lucan's Imperium",
    aAllegiances['Ma'] = "Margaret's Stronghold",
    aAllegiances['Rv'] = 'Restored Vilani Empire',
    aAllegiances['St'] = "Strephon's Imperium",
    aAllegiances['Wi'] = 'Wilds',
    aAllegiances['Zc'] = 'Zodia Colonies',
    aAllegiances['--'] = 'Uncharted Space';
    aAllegiances['Bs'] = 'Belgardian Sojurnate',
    aAllegiances['Ca'] = 'Carrillian Assembly',
    aAllegiances['Pc'] = 'Principality of Caledon',
    aAllegiances['Ct'] = 'Carter Technocracy',
    aAllegiances['Cl'] = 'Council of Leh Perash',
    aAllegiances['Cu'] = 'Cytralin Unity',
    aAllegiances['Dc'] = 'Darrian Confederation',
    aAllegiances['Dc'] = 'Confederation of Duncinae',
    aAllegiances['Fh'] = 'Federation of Heron',
    aAllegiances['Fl'] = 'Florian League',
    aAllegiances['Gr'] = 'Gamma Republic',
    aAllegiances['Gm'] = 'Grand Duchy of Marlheim',
    aAllegiances['Gd'] = 'Grand Duchy of Stoner',
    aAllegiances['Go'] = 'Gerontocracy of Ormine',
    aAllegiances['Ge'] = 'Glorious Empire',
    aAllegiances['Gf'] = 'Glimmerdrift Federation',
    aAllegiances['Gc'] = 'Gniivi Collective',
    aAllegiances['Hv'] = 'Hive Federation',
    aAllegiances['Id'] = 'Islaiat Dominate',
    aAllegiances['Ju'] = 'Julian Protectorate',
    aAllegiances['Cs'] = 'Julian Protectorate',
    aAllegiances['Ju'] = 'Julian Protectorate',
    aAllegiances['Kl'] = 'Khuur League',
    aAllegiances['Lr'] = 'Loyal Nineworlds Republic',
    aAllegiances['Kk'] = "K'kree Two Thousand Worlds empire",
    aAllegiances['Lc'] = 'Lanyard Colonies',
    aAllegiances['Me'] = 'Maskai Empire',
    aAllegiances['Ow'] = 'Outcasts of the Whispering Sky',
    aAllegiances['Ra'] = 'Ral Ranta',
    aAllegiances['Sf'] = 'Senlis Foederate',
    aAllegiances['So'] = 'Solomani Confederation',
    aAllegiances['Sc'] = 'Strend Cluster',
    aAllegiances['Sw'] = 'Sword Worlds Confederation',
    aAllegiances['Ta'] = 'Tealou Arlaoh (Aslan independent clan, non-outcast)',
    aAllegiances['Uh'] = 'Union of Harmony',
    aAllegiances['V4'] = '40th Squadron (Ekhelle Ksafi)',
    aAllegiances['Ac'] = 'Anti-Rukh Coalition (Gnoerrgh Rukh Lloell)',
    aAllegiances['Ua'] = 'United Followers of Augurgh',
    aAllegiances['Ba'] = 'Bakne Alliance',
    aAllegiances['Ck'] = 'Commonality of Kedzudh (Kedzudh Aeng)',
    aAllegiances['Df'] = 'Dzarrgh Federate',
    aAllegiances['Li'] = 'Llaeghskath Interacterate',
    aAllegiances['Pg'] = 'Pact of Gaerr (Gaerr Thue)',
    aAllegiances['Rs'] = 'Rranglloez Stronghold',
    aAllegiances['Wr'] = 'Worlds of Leader Rukh (Rukh Aegz)',
    aAllegiances['Sd'] = 'Saeknouth Dependency (Saeknouth Igz)',
    aAllegiances['Se'] = 'Society of Equals (Dzen Aeng Kho)',
    aAllegiances['Te'] = 'Thoengling Empire (Thoengling Raghz)',
    aAllegiances['Te'] = 'Thirz Empire (Thirz Uerra)',
    aAllegiances['Ur'] = 'Urukhu',
    aAllegiances['Ev'] = 'Empire of Varroerth',
    aAllegiances['Pw'] = 'People of Wanz',
    aAllegiances['Wp'] = 'Windhorn Pact of Two'

    return aAllegiances[sAllegiance];

  }

  async function getTradeCode(sTradeCode) {

    const aTradeCodes = {};

    aTradeCodes['Ag'] = 'Agricultural',
    aTradeCodes['As'] = 'Asteroid',
    aTradeCodes['Ba'] = 'Barren',
    aTradeCodes['De'] = 'Desert',
    aTradeCodes['Fl'] = 'Fluid Oceans',
    aTradeCodes['Ga'] = 'Garden',
    aTradeCodes['Hi'] = 'High Population',
    aTradeCodes['Ht'] = 'High Tech',
    aTradeCodes['Ie'] = 'Ice-Capped',
    aTradeCodes['In'] = 'Industrial',
    aTradeCodes['Lo'] = 'Low Population',
    aTradeCodes['Lt'] = 'Low Tech',
    aTradeCodes['Na'] = 'Non-Agricultural',
    aTradeCodes['Ni'] = 'Non-Industrial',
    aTradeCodes['Po'] = 'Poor',
    aTradeCodes['Ri'] = 'Rich',
    aTradeCodes['Va'] = 'Vacuum',
    aTradeCodes['Wa'] = 'Water World';

    return aTradeCodes[sTradeCode];

  }

  async function getStarportQuality(sStarportQuality) {

    const aStarportQuality = {};

    aStarportQuality["A"] = "Excellent",
    aStarportQuality["B"] = "Good",
    aStarportQuality["C"] = "Routine",
    aStarportQuality["D"] = "Poor",
    aStarportQuality["E"] = "Frontier",
    aStarportQuality["X"] = "No Starport"

    return aStarportQuality[sStarportQuality];

  }

  async function getSize(sSize) {

    const aSize = {};

    aSize["1"] = "1,600km",
    aSize["2"] = "3,200km, Triton, Luna, Europa",
    aSize["3"] = "4,800km, Mercury, Ganymede",
    aSize["4"] = "6,400km, Mars",
    aSize["5"] = "8,000km",
    aSize["6"] = "9,600km",
    aSize["7"] = "11,200km",
    aSize["8"] = "12,800km Earth",
    aSize["9"] = "14,400km",
    aSize["10"] = "16,000km",
    aSize["A"] = "16,000km"

    return aSize[sSize];

  }

  async function getAtmosphereType(sAtmosphereType) {

    const aAtmosphereType = {};

    aAtmosphereType["0"] = "None",
    aAtmosphereType["1"] = "Trace",
    aAtmosphereType["2"] = "Very Thin, Tainted",
    aAtmosphereType["3"] = "Very Thin",
    aAtmosphereType["4"] = "Thin, Tainted",
    aAtmosphereType["5"] = "Thin",
    aAtmosphereType["6"] = "Standard",
    aAtmosphereType["7"] = "Standard, Tainted",
    aAtmosphereType["8"] = "Dense",
    aAtmosphereType["9"] = "Dense, Tainted",
    aAtmosphereType["A"] = "Exotic",
    aAtmosphereType["B"] = "Corrosive",
    aAtmosphereType["C"] = "Insidious",
    aAtmosphereType["D"] = "Dense, High",
    aAtmosphereType["E"] = "Thin, Low",
    aAtmosphereType["F"] = "Unusual"

    return aAtmosphereType[sAtmosphereType];

  }

  async function getHydrographics(sHydrographics) {

    const aHydrographics = {};

    aHydrographics["0"] = "0%-5% Desert world",
    aHydrographics["1"] = "6%-15% Dry world",
    aHydrographics["2"] = "16%-25% A few small seas",
    aHydrographics["3"] = "26%-35% Small seas and oceans",
    aHydrographics["4"] = "36%-45% Wet world",
    aHydrographics["5"] = "46%-55% Large oceans",
    aHydrographics["6"] = "56%-65%",
    aHydrographics["7"] = "66%-75% Earth-like world",
    aHydrographics["8"] = "76%-85% Water world",
    aHydrographics["9"] = "86%-95% Only a few small islands and archipelagos",
    aHydrographics["10"] = "96-100% Almost entirely water",
    aHydrographics["A"] = "96-100% Almost entirely water"

    return aHydrographics[sHydrographics];

  }

  async function getPopulation(sPopulation) {

    const aPopulation = {};

    aPopulation["0"] = "None",
    aPopulation["1"] = "Few",
    aPopulation["2"] = "Hundreds",
    aPopulation["3"] = "Thousands",
    aPopulation["4"] = "Tens of Thousands",
    aPopulation["5"] = "Hundreds of thousands",
    aPopulation["6"] = "Millions",
    aPopulation["7"] = "Tens of millions",
    aPopulation["8"] = "Hundreds of millions",
    aPopulation["9"] = "Billions",
    aPopulation["A"] = "Tens of billions",
    aPopulation["B"] = "Hundreds of billions",
    aPopulation["C"] = "Trillions"

    return aPopulation[sPopulation];

  }

  async function getGovernmentType(sGovernmentType) {

    const aGovernmentType = {};

    aGovernmentType["0"] = "None"
    aGovernmentType["1"] = "Company/corporation",
    aGovernmentType["2"] = "Participating democracy",
    aGovernmentType["3"] = "Self-perpetuating oligarchy",
    aGovernmentType["4"] = "Representative democracy",
    aGovernmentType["5"] = "Feudal technocracy",
    aGovernmentType["6"] = "Captive government",
    aGovernmentType["7"] = "Balkanisation",
    aGovernmentType["8"] = "Civil service bureaucracy",
    aGovernmentType["9"] = "Impersonal Bureaucracy",
    aGovernmentType["A"] = "Charismatic dictator",
    aGovernmentType["B"] = "Non-charismatic leader",
    aGovernmentType["C"] = "Charismatic oligarchy",
    aGovernmentType["D"] = "Religious dictatorship"

    return aGovernmentType[sGovernmentType];

}

async function getLawLevel(sLawLevel) {

  const aLawLevel = {};

  aLawLevel["0"] = "No restrictions - heavy armour and a handy weapon recommended...",
  aLawLevel["1"] = "No Poison gas, explosives, undetectable weapons, WMD or Battle Dress",
  aLawLevel["2"] = "No Portable energy and laser weapons or Combat armour",
  aLawLevel["3"] = "No Military weapons or Flak armour",
  aLawLevel["4"] = "No Light assault weapons and submachine guns or Cloth armour",
  aLawLevel["5"] = "No Personal concealable weapons or Mesh armour",
  aLawLevel["6"] = "No firearms except shotguns & stunners; carrying weapons discouraged",
  aLawLevel["7"] = "No Shotguns",
  aLawLevel["8"] = "No bladed weapons, stunners or visible armour",
  aLawLevel["9"] = "No weapons, No armour",
  aLawLevel["A"] = "No weapons, No armour",
  aLawLevel["B"] = "No weapons, No armour",
  aLawLevel["C"] = "No weapons, No armour",
  aLawLevel["D"] = "No weapons, No armour",
  aLawLevel["E"] = "No weapons, No armour",
  aLawLevel["F"] = "No weapons, No armour",
  aLawLevel["G"] = "No weapons, No armour",
  aLawLevel["H"] = "No weapons, No armour"


  return aLawLevel[sLawLevel];
}

async function createXMLDefinitionFile(sSector, sDefinitionFileName) {

  const sXML = '<?xml version="1.0" encoding="iso-8859-1"?>\r\n' +
  '<root version="3.3" release="1|CoreRPG:4">\r\n' +
    '  <name>' + sSector + ' Worlds Data</name>\r\n' +
    '  <category></category>\r\n' +
    '  <author>Sector World Data</author>\r\n' +
    '  <ruleset>MGT2</ruleset>\r\n' +
  '</root>'

  return fs.writeFileSync(sDefinitionFileName, sXML);
}

async function createXMLDDBFile(sSector) {

  const sName = sSector.replace(/\s/g, '').toLowerCase() + 'worldsdata';

  const sXML = '<?xml version="1.0" encoding="iso-8859-1"?>\r\n' +
  '<root version="3.3" release="1|CoreRPG:4">\r\n' +
  '  <library>\r\n' +
  '    <worldsdata static="true">\r\n' +
  '      <categoryname type="string"></categoryname>\r\n' +
  `      <name type="string">${sName}</name>\r\n` +
  '      <entries>\r\n' +
  '        <worlds>\r\n' +
  '          <librarylink type="windowreference">\r\n' +
  '            <class>reference_list</class>\r\n' +
  '            <recordname>..</recordname>\r\n' +
  '          </librarylink>\r\n' +
  '          <name type="string">Worlds</name>\r\n' +
  '          <recordtype type="string">worlds</recordtype>\r\n' +
  '        </worlds>\r\n' +
  '      </entries>\r\n' +
  '    </worldsdata>\r\n' +
  '  </library>\r\n' +
  '  <worlds>\r\n' +
  '    <category name="" baseicon="0" decalicon="0">\r\n';

  return writeToFile.write(sXML);
}

async function createXMLDDBFileEnd() {

  const sXML = '    </category>\r\n' +
  '  </worlds>\r\n' +
  '</root>\r\n';

  return writeToFile.write(sXML);
}

async function buildZip(sSector, sFileName, sDefinitionFileName) {

  let sModuleName = `${sSector} Worlds Module.mod`;

  console.log("Zipping Module");
  var files = [{
          source: sDefinitionFileName,
          target: 'definition.xml'
      },
      {
          source: sFileName,
          target: 'db.xml'
      }
  ];
  var zipModule = new EasyZip();
  zipModule.batchAdd(files, {
      ignore_missing: true
  }, () => {
    zipModule.writeToFile(sModuleName);
  });

}









  // 1-14: Name
  // 15-18: HexNbr
  // 20-28: UWP
  //    31: Bases
  // 33-47: Codes & Comments
  //    49: Zone
  // 52-54: PBG
  // 56-57: Allegiance
  // 59-74: Stellar Data

  // ....+....1....+....2....+....3....+....4....+....5....+....6....+....7....+....8

  // Grote         1731 A400404-B    Ni Va              124 Im F8 V
  // Ffudn         2334 A41489D-C    Ic Ph Pi Pz     A  904 Im M0 V
  // Bendor        2336 A756656-C  A Ag Ni Ga           820 Im F5 V

  // // name|Chronor
  // uwp|A6369A5-D
  // domain|-
  // sector|Spinward Marches
  // subsector|Deneb
  // hex_code|0304
  // trade_codes|Hi
  // travel_code|
  // bases|Z M
  // allegiance|Consulate
  // system|G
  // notes|The Cronor system is the regional capital for the Zhodani Consulate in the Spinward Marches. As such, it is heavily protected by both in-system (non-jump capable) and conventional naval assets, as well as ground forces. A large detachment of what Imperials refer to as the Consular Guard protects governmental installations and stands ready to fight large-scale battles.
  // berthing_cost|
  // fuel|
  // facilities|
  // extras|

  // #!;A - Cronor
  // ##;A - Cronor
  // #wb;singletext
  // #ts;
  // #th;Name;Location;Bases;2:Statistics;Trade Codes;Travel Code;2:Allegiance;Gas Giants
  // #tr;Algebaster;0605;;2:C665658-9;Ag Ni Ga Ri;1:;2:;1:
  // #tr;Atsa;0307;Z M;2:B4337CA-A;Na Po;A;2:Consulate;1:
  // #te;
