const {DataTypes} = require('sequelize');
const sequelize = require('../database');
const Province = require('./province');
const City = require('./cities');

const Bandara = sequelize.define('bandara', {
    kode_bandara: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nama_bandara: {
        type: DataTypes.STRING,
        allowNull: false
    },
    provinsi_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    kota_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
}, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'bandara'
})

Bandara.belongsTo(Province, {
    foreignKey: 'provinsi_id',
    as: 'province'
});

Bandara.belongsTo(City, {
    foreignKey: 'kota_id',
    as: 'city'
})

module.exports = Bandara;