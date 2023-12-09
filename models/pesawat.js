const {DataTypes} = require('sequelize');
const sequelize = require('../database');

const Pesawat = sequelize.define('pesawat', {
    kode_pesawat: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nama_pesawat: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'pesawat'
})

module.exports = Pesawat;