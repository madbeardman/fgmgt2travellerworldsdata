# ⚠️ DEPRECATED – See New Version Below

🚨 This repository is now **deprecated** and no longer actively maintained. It has been fully updated to work again if you need a CLI/NodeJS version.

👉 For the latest version with a web-based interface, please use the new frontend-enabled application here:  
**[https://github.com/madbeardman/fgmgt-world-generator-frontend](https://github.com/madbeardman/fgmgt-world-generator-frontend)**

---

## Fantasy Grounds Traveller World Generator (CLI)

This app is written to generate the data files (text) for the Fantasy Grounds internal parsing application. It saves many hours building them by hand or copying and pasting from PDFs.

It uses the [TravellerMap API](https://travellermap.com/doc/api) to pull down UWP data for a sector, split by subsectors. This includes the subsector data and all systems within them.

The files are written to the `./data` folder using the sector name as the basis. Three formats are supported:
- `refmanual` (for FG Reference Manual pages)
- `system` (for plain-text system listings)
- `module` (generates a `.mod` zip for use in Fantasy Grounds)

## ⚙️ Requirements

- Node.js v12 or later

## 📦 Installation

Clone this repo and run:

```bash
npm install
```

This installs all required libraries.

## 🚀 Running the Generator

Use:

```bash
npm start
```

> ⚠️ Existing data for the selected sector will be overwritten.

## 🔧 Configuration

Create a `.env` file in the root directory. Rename `env sample` to `.env` as a starting point.

### Example `.env` configuration:

```env
SECTOR=Reft
BUILD_TYPE=module
SORT=alpha
HEXCODE=sector
```

- `SECTOR`: Sector name (case-sensitive, must match TravellerMap spelling)
- `BUILD_TYPE`: One of `module`, `ref`, or `system` (defaults to `ref`)
- `SORT`: Optional, use `alpha` to sort systems alphabetically
- `HEXCODE`: `sector` or `subsector` (default is `sector`)

## 🧪 Tests

There are no unit tests at this time.

## 📄 License

This application is licensed under the ISC License.

However, the data it generates is subject to the Far Future Enterprises Fair Use Policy.  
See: [https://www.farfuture.net/FFEFairUsePolicy2008.pdf](https://www.farfuture.net/FFEFairUsePolicy2008.pdf)

If you use this application, please credit:

**Colin 'MadBeardMan' Richardson**
