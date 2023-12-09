const express = require("express");
const {getBandara} = require("./controller/scrape_bandara");
const app = express();
const logger = require('pino')()
require("./database");
const {getCities, getProvince} = require("./controller/read_location");
const {getPesawat} = require("./controller/read_pesawat");
const {getMaskapai} = require("./controller/scrape_pesawat");
const {scrapeStasiun} = require("./controller/scrape_stasiun");
const {scrapeKereta} = require("./controller/scrape_kereta");

app.get('/', (req, res) => {
  res.send('Hello World');
})

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/bandara', getBandara)
app.get('/cities', getCities)
app.get('/provinces', getProvince)

app.get('/scrape-pesawat', getMaskapai)
app.get('/scrape-stasiun', scrapeStasiun)
app.get('/scrape-kereta', scrapeKereta)
app.get('/pesawat', getPesawat)

app.listen(3000, () => {
    logger.info('App listening on port 3000!');
})