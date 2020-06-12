This app is written to generate the data files (text) for the Fantasy Grounds internal parsing application.  It saves the many hours building them by hand, or copying and pasting them from PDFs etc.

To do this we use the TravellerMAP API's.  This amongst other things, allows this app to pull down the UWP data for a sector split by subsectors.

<https://travellermap.com/doc/api>

This includes the subsectors and all worlds within those subsectors.

The files are written as text files in the `./data` sub-folder using the sector name as the basis.

The format of these files are fixed, one is for the Reference Manual and the other is for the World data.  There are plans to produce Fantasy Grounds mod file in a future build.

It's written using NodeJS v12.  Make sure you are using v12 and above before you run this.

**To install**

After cloning this repo, make sure you're in the repo folder inside a terminal window

`npm i`

That should install all the libraries required for the app.

**To Run**

`npm start`

Please note that if data already exists for the sector, it will be replaced with the new data.

**Tests**

There are currently no Unit Tests.

### Configuring what data format is used

At the moment, there's no UI with this app, I don't see the need for it for my own needs, but might create a UI in the future, it really needs refactoring now everything is there.

Editing the main file, `index.js` at the top you'll find something like:

> const sSector = 'Reft';

> const sBuildType = 'module';

You can change the sector by editing it here, note that it's case senstive and spelling must be accurate, otherwise an error will be thrown.




