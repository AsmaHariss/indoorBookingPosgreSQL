const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./userModel');
const Court = require('./courtModel');

const bookingModel = sequelize.define('bookingModel', {
    startTime: { type: DataTypes.STRING, allowNull: false },
    endTime: { type: DataTypes.STRING, allowNull: false },
    sportName: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
});

bookingModel.belongsTo(User, { foreignKey: 'userId' });
bookingModel.belongsTo(Court, { foreignKey: 'courtId' });

module.exports = bookingModel;
