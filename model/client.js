const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const client = sequelize.define('Client',{
    first_name : {
        type : DataTypes.STRING,
        allowNull : false
    },
    last_name : {
        type : DataTypes.STRING,
        allowNull : false
    },
    username : {
        type : DataTypes.STRING,
        allowNull : false,
        unique : true
    },
    email : {
        type : DataTypes.STRING,
        allowNull : false
    },
    password : {
        type : DataTypes.STRING,
        allowNull : false
    }
},{freezeTableName : true})

client.sync({alter : true}).then(()=> {
    console.log('Table for the model was created')
});


module.exports = client;