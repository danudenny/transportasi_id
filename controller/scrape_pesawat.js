const cheerio = require('cheerio');
const axios = require('axios');
const logger = require('pino')();

const Pesawat = require('../models/pesawat');

const url = 'https://id.wikipedia.org/wiki/Daftar_maskapai_penerbangan_Indonesia';

exports.getMaskapai = async (req, res) => {
    /*
    <table class="wikitable sortable" style="font-size:95%;">
    Nama maskapai | Kode IATA | Kode ICAO | Panggilan | Basis utama | Basis lainnya | Tahun berdiri
    ------------------------------------------------------------------------------------------------
    Airfast Indonesia | FS | AFE | Airfast | Bandar Udara Internasional Soekarno-Hatta | | 1971
    */

    const {sortBy} = req.query;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const table = $('.sortable');
        const tableRow = table.find('tr');
        const maskapai = [];
        tableRow.each((i, el) => {
            const namaMaskapai = $(el).find('td:nth-child(2)').text();
            const kodeIata = $(el).find('td:nth-child(3)').text();

            if (namaMaskapai) {
                maskapai.push({
                    namaMaskapai,
                    kodeIata,
                })
            }
        })

        maskapai.forEach((el, i) => {
            for (let key in el) {
                maskapai[i][key] = maskapai[i][key].replace(/\n/g, '');
            }
        })

        if (sortBy) {
            maskapai.sort((a, b) => {
                if (a[sortBy] < b[sortBy]) {
                    return -1;
                }
                if (a[sortBy] > b[sortBy]) {
                    return 1;
                }
                return 0;
            })
        }

        for (const el of maskapai) {
            const {namaMaskapai, kodeIata} = el;
            const pesawat = await Pesawat.findOne({
                where: {
                    kode_pesawat: kodeIata
                }
            })

            if (!pesawat) {
                await Pesawat.create({
                    kode_pesawat: kodeIata,
                    nama_pesawat: namaMaskapai
                })
            }
        }

        res.status(200).json({
            message: "Success scrape pesawat",
        })
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            error: error.message
        })
    }
}