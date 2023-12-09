const {DataTypes} = require('sequelize');
const sequelize = require('../database');

const Province = sequelize.define('provinces', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    timestamps: false
})

module.exports = Province;