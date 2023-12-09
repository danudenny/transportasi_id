const {DataTypes} = require('sequelize');
const sequelize = require('../database');
const Province = require('./province');

const Cities = sequelize.define('cities', {
    province_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    timestamps: false
})

Cities.belongsTo(Province, {
    foreignKey: 'province_id',
    as: 'province'
});

module.exports = Cities;