const cheerio = require('cheerio');
const axios = require('axios');
const logger = require('pino')();

const KeretaApi = require('../models/kereta-api');
const Stasiun = require('../models/stasiun-ka');

const url = 'https://railfansid.fandom.com/id/wiki/Daftar_Kereta_api_di_Indonesia_GAPEKA_2021'

exports.scrapeKereta = async (req, res) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const kereta = [];

        $('table.article-table tbody tr').each((index, element) => {
            if (index === 0) return true;
            const nama_kereta = $(element).find('td:nth-child(4)').text();
            const kode_kereta = $(element).find('td:nth-child(2)').text()

            const st_keberangkatan = $(element).find('td:nth-child(5)').text();
            const st_kedatangan = $(element).find('td:nth-child(6)').text();

            const stasiun_keberangkatan_id = st_keberangkatan.substring(st_keberangkatan.indexOf("(")+1,st_keberangkatan.indexOf(")"));
            const stasiun_kedatangan_id = st_kedatangan.substring(st_kedatangan.indexOf("(")+1,st_kedatangan.indexOf(")"));

            kereta.push({
                nama_kereta,
                kode_kereta,
                stasiun_keberangkatan_id,
                stasiun_kedatangan_id
            })
        })

        kereta.forEach((element) => {
            for (const key in element) {
                element[key] = element[key].replace(/\n/g, '');
            }
        })

        const keretaWithoutPerintis = kereta.filter((element) => {
            const kode_kereta = element.kode_kereta;
            return (
                kode_kereta !== 'U99' &&
                kode_kereta !== 'U100' &&
                kode_kereta !== 'U101' &&
                kode_kereta !== 'U102' &&
                kode_kereta !== 'U103' &&
                kode_kereta !== 'U104' &&
                kode_kereta !== 'U105' &&
                kode_kereta !== 'U106'
            );
        });

        for (const element of keretaWithoutPerintis) {
            const stasiun_keberangkatan = await Stasiun.findOne({
                where: {
                    kode_stasiun: element.stasiun_keberangkatan_id
                }
            })
            const stasiun_kedatangan = await Stasiun.findOne({
                where: {
                    kode_stasiun: element.stasiun_kedatangan_id
                }
            })

            if (!stasiun_keberangkatan || !stasiun_kedatangan) {
                logger.error('Stasiun not found', {
                    stasiun_keberangkatan: element.stasiun_keberangkatan_id,
                    stasiun_kedatangan: element.stasiun_kedatangan_id
                })
            }

            element.stasiun_keberangkatan_id = stasiun_keberangkatan.id;
            element.stasiun_kedatangan_id = stasiun_kedatangan.id;


            const keretaApi = await KeretaApi.findOne({
                where: {
                    kode_kereta: element.kode_kereta
                }
            })

            if (!keretaApi) {
                await KeretaApi.create({
                    nama_kereta: element.nama_kereta,
                    kode_kereta: element.kode_kereta,
                    stasiun_keberangkatan_id: element.stasiun_keberangkatan_id,
                    stasiun_kedatangan_id: element.stasiun_kedatangan_id
                })
            }
        }

        res.json({
            message: 'Scrape Kereta Api Success',
        })
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}