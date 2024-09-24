const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./userModel');

const registrationModel = sequelize.define('registrationModel', {
    
    courtName: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    sportName: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },

});

registrationModel.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = registrationModel;
