const Cities = require('../models/cities');
const Province = require('../models/province');
const {Op} = require("sequelize");

exports.getCities = async (req, res) => {
    try {
        const cities = await Cities.findAll({
            attributes: ['id', 'province_id', 'name'],
            include: {
                model: Province,
                attributes: ['name'],
                as: 'province'
            },
        })

        res.json({
            status: 'success',
            data: cities
        });
    } catch (error) {
        res.json({
            status: 'error',
            message: error.message
        });
    }
}

exports.getProvince = async (req, res) => {
    try {
        const province = await Province.findAll();
        res.json({
            status: 'success',
            data: province
        });
    } catch (error) {
        res.json({
            status: 'error',
            message: error.message
        });
    }
}