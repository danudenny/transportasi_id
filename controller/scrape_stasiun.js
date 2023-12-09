const cheerio = require('cheerio');
const axios = require('axios');
const logger = require('pino')();

const Stasiun = require('../models/stasiun-ka');
const Province = require('../models/province');
const City = require('../models/cities');
const {Op} = require("sequelize");

const url = 'https://id.wikipedia.org/wiki/Daftar_stasiun_kereta_api_di_Indonesia';
exports.scrapeStasiun = async (req, res) => {
    const {sortBy} = req.query;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const table = $('.wikitable');
        const tableRow = table.find('tr');
        const stasiun = [];
        tableRow.each((i, el) => {
            const namaStasiun = $(el).find('td:nth-child(1)').text();
            const provinsi = $(el).find('td:nth-child(2)').text();
            const kodeStasiun = $(el).find('td:nth-child(4)').text();
            const status = $(el).find('td:nth-child(5)').text();

            if (kodeStasiun) {
                stasiun.push({
                    kodeStasiun,
                    namaStasiun,
                    provinsi,
                    status
                })
            }
        })

        stasiun.forEach((el, i) => {
            for (let key in el) {
                stasiun[i][key] = stasiun[i][key].replace(/\n/g, '');
            }
        })

        if (sortBy) {
            stasiun.sort((a, b) => {
                if (a[sortBy] < b[sortBy]) {
                    return -1;
                }
                if (a[sortBy] > b[sortBy]) {
                    return 1;
                }
                return 0;
            })
        }

        const stasiunMapped = stasiun.map(el => {
            if (el.provinsi === '"D.I Yogyakarta') {
                el.provinsi = 'DI YOGYAKARTA'
            }

            el.status = el.status === 'Beroperasi';

            return {
                namaStasiun: el.namaStasiun,
                kodeStasiun: el.kodeStasiun,
                provinsi: el.provinsi,
                status: el.status
            }
        })

        for (const el of stasiunMapped) {
            const {namaStasiun, kodeStasiun, provinsi, status} = el;
            const province = await Province.findOne({
                where: {
                    name: {
                        [Op.like]: `%${provinsi}%`
                    }
                }
            })

            if (province) {
                const city = await City.findOne({
                    where: {
                        province_id: province.id
                    }
                })

                if (city) {
                    await Stasiun.create({
                        kode_stasiun: kodeStasiun,
                        nama_stasiun: namaStasiun,
                        provinsi_id: province.id,
                        is_active: status,
                    })
                }
            }
        }

        res.status(200).json({
            message: stasiun
        })
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            error: error.message
        })
    }
}