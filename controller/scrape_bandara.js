const cheerio = require('cheerio');
const axios = require('axios');
const logger = require('pino')();
const Bandara = require('../models/bandara');
const Province = require("../models/province");

const url = 'https://id.wikipedia.org/wiki/Daftar_bandar_udara_di_Indonesia';

exports.getBandara = async (req, res) => {
    /*

    <table class="wikitable sortable jquery-tablesorter" style="font-size:95%;">

    Nama bandar udara  | Lokasi | Provinsi | ICAO | IATA | Pengelola | Kelas | Dinamai berdasarkan
    ----------------------------------------------------------------------------------------------
    Bandar Udara Internasional Soekarno-Hatta | Cengkareng | Banten | WIII | CGK | PT Angkasa Pura II | Internasional | Soekarno dan Mohammad Hatta
    */

    const {sortBy} = req.query;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const table = $('.wikitable');
        const tableRow = table.find('tr');
        const bandara = [];
        tableRow.each((i, el) => {
            const namaBandara = $(el).find('td:nth-child(1)').text();
            const lokasi = $(el).find('td:nth-child(2)').text();
            const provinsi = $(el).find('td:nth-child(3)').text();
            const icao = $(el).find('td:nth-child(4)').text();
            const iata = $(el).find('td:nth-child(5)').text();
            const pengelola = $(el).find('td:nth-child(6)').text();
            const kelas = $(el).find('td:nth-child(7)').text();
            const dinamaiBerdasarkan = $(el).find('td:nth-child(8)').text();

            if (namaBandara) {
                bandara.push({
                    namaBandara,
                    lokasi,
                    provinsi,
                    icao,
                    iata,
                    pengelola,
                    kelas,
                    dinamaiBerdasarkan
                })
            }
        })

        bandara.forEach((el, i) => {
            for (let key in el) {
                bandara[i][key] = bandara[i][key].replace(/\n/g, '');
            }
        })

        if (sortBy) {
            bandara.sort((a, b) => {
                if (a[sortBy] < b[sortBy]) {
                    return -1;
                }
                if (a[sortBy] > b[sortBy]) {
                    return 1;
                }
                return 0;
            })
        }

        const province = await Province.findAll({
            attributes: ['id', 'name']
        });

        const provinceData = province.map(el => {
            return {
                id: el.id,
                name: el.name
            }
        });

        const bandaraData = bandara.map(el => {
            return {
                nama_bandara: el.namaBandara,
                lokasi: el.lokasi,
                provinsi: el.provinsi,
                icao: el.icao,
                iata: el.iata,
                pengelola: el.pengelola,
                kelas: el.kelas,
                dinamai_berdasarkan: el.dinamaiBerdasarkan
            }
        })

        const bandaraMapped = bandaraData.map(el => {
            if (el.provinsi !== '') {
                if (el.provinsi === 'Daerah Istimewa Yogyakarta') {
                    el.provinsi = 'DI YOGYAKARTA';
                }

                if (el.provinsi === 'Riau') {
                    el.provinsi = 'KEPULAUAN RIAU';
                }

                if (el.provinsi === 'Kepulauan Bangka Belitung') {
                    el.provinsi = 'BANGKA BELITUNG';
                }

                if (el.provinsi.match(/^Papua\s/) && el.provinsi !== 'Papua Barat') {
                    el.provinsi = 'PAPUA';
                }

                if (el.provinsi === 'Jakarta') {
                    el.provinsi = 'DKI JAKARTA';
                }
                const province = provinceData.find(prov => prov.name.toLowerCase() === el.provinsi.toLowerCase());
                return {
                    ...el,
                    provinsi_id: province.id
                }
            }
            return el;
        });

        const bandaraMappedLength = bandaraMapped.length;

        for (let i = 0; i < bandaraMappedLength; i++) {
            const {nama_bandara, provinsi_id, iata} = bandaraMapped[i];
            const kode_bandara = iata;
            const is_active = true;

            try {
                const bandara = await Bandara.findOne({
                    where: {
                        nama_bandara
                    }
                });

                if (bandara) {
                    await bandara.update({
                        kode_bandara,
                        provinsi_id,
                        is_active
                    });
                } else {
                    await Bandara.create({
                        nama_bandara,
                        kode_bandara,
                        provinsi_id,
                        is_active
                    });
                }

                logger.info(`Success add bandara ${nama_bandara}`);
            } catch (error) {
                logger.error(error);
            }
        }

        res.send({
            message: 'success add bandara',
        });
    } catch (error) {
        logger.error('Error scraping bandara', error);
        res.status(500).send({
            message: 'Error scraping bandara'
        })
    }
}