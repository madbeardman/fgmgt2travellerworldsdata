Greetings,

This app uses the TravellerMAP API's to pull down data for a sector.

This includes the subsectors and all worlds within those subsectors.

The files are written as text files in the `./data` sub-folder using the sector name as the basis.

The format of these files are for use within Fantasy Grounds.  At this moment in time, the output for the Reference Manual is one format, the other is the format to import the data into the worlds lists.

It's written using NodeJS v12.  Make sure you are using v12 and above.

**To install**

After cloning this repo, make sure you're in the repo folder inside a terminal window

`npm i`

That should install all the libraries required for the app.

**To Run**

`npm start`

Please note that if data already exists for the sector, it will be replaced with the new data.

### Configuring what data format is used

At the moment, there's no UI with this app, I don't see the need for it.

Editing the main file, `index.js` at the top you'll find something like:

> const sSector = 'Reft';

> const bRefManualData = true;

You can change the sector by editing it here, note that it's case senstive and spelling must be accurate, otherwise an error will be thrown.




