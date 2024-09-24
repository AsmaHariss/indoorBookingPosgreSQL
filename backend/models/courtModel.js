const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const courtModel = sequelize.define('courtModel', {
    name: { type: DataTypes.STRING, allowNull: false },
    sportName: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
});

module.exports = courtModel;
