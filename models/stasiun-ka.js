const {DataTypes} = require('sequelize');
const sequelize = require('../database');
const Province = require('./province');
const City = require('./cities');

const StasiunKA = sequelize.define('stasiun_ka', {
    kode_stasiun: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nama_stasiun: {
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
    tableName: 'stasiun'
})

StasiunKA.belongsTo(Province, {
    foreignKey: 'provinsi_id',
    as: 'province'
});

StasiunKA.belongsTo(City, {
    foreignKey: 'kota_id',
    as: 'city'
})

module.exports = StasiunKA;