const Sequelize = require('sequelize');
const sequelize = require('../db/config');
const Address = require('./address');
const client = sequelize.define('Client',{
    first_name : {
        type : Sequelize.STRING,
        allowNull : false
    },
    last_name : {
        type : Sequelize.STRING,
        allowNull : false
    },
    username : {
        type : Sequelize.STRING,
        allowNull : false,
        unique : true
    },
    email : {
        type : Sequelize.STRING,
        allowNull : false
    },
    password : {
        type : Sequelize.STRING,
        allowNull : false
    }
},{freezeTableName : true})

client.sync({alter : true}).then(()=> {
    console.log(' CLient table has been altered ')
});

client.hasMany(Address , {
    foreignKey : 'userId',
    as : 'Address'
})

Address.belongsTo(client, {
    foreignKey : 'userId',
    as : 'Client'
})

module.exports = client;