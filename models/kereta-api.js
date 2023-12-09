const {DataTypes} = require('sequelize');
const db = require('../database');
const Stasiun = require('./stasiun-ka');

const KeretaApi = db.define('kereta_api', {
    nama_kereta: {
        type: DataTypes.STRING,
        allowNull: false
    },
    kode_kereta: {
        type: DataTypes.STRING,
        allowNull: false
    },
    stasiun_keberangkatan_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    stasiun_kedatangan_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'kereta_api',
    timestamps: false
});

KeretaApi.belongsTo(Stasiun, {
    foreignKey: 'stasiun_keberangkatan_id',
    as: 'keberangkatan'
})

KeretaApi.belongsTo(Stasiun, {
    foreignKey: 'stasiun_kedatangan_id',
    as: 'kedatangan'
})

module.exports = KeretaApi;