const {Sequelize} = require('sequelize');
const logger = require('pino')();
require('dotenv').config();

const {DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_HOST} = process.env;

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    logging: false,
});

try {
    sequelize.authenticate().then(() => logger.info('Database connection has been established successfully.'));
} catch (error) {
    logger.error('Unable to connect to the database:', error);
}

module.exports = sequelize;