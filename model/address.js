const Sequelize = require('sequelize');
const sequelize = require('../db/config');
const Client = require('./client');

const address = sequelize.define('address',{
    userId : {
        type : Sequelize.INTEGER,
        references : {
            model : Client,
            key : 'id'
        }
    },
    address : {
        type : Sequelize.STRING,
    },
    city : {
        type : Sequelize.STRING,
    },
    state : {
        type : Sequelize.STRING
    },
    pin_code : {
        type : Sequelize.STRING,
    },
    phone_no : {
        type : Sequelize.STRING,
    },
},{freezeTableName : true})

address.sync({alter : true}).then(()=> {
    console.log(' ')
});



module.exports = address;