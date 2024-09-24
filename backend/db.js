const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('indoor-booking', 'postgres', 'Admin', {
    host: 'localhost',
    dialect: 'postgres',
    
});

sequelize.authenticate()
    .then(() => console.log('DB connected'))
    .catch(err => console.error('error:', err));

module.exports = sequelize;
