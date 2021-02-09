const dotenv = require('dotenv');
dotenv.config();
const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME,process.env.USER_NAME,process.env.PASSWORD,{
    host : process.env.HOST, 
    dialect : 'mysql'
})

const connection =async () => {
    try {
        await sequelize.authenticate();
        console.log('connection setup');
    }catch(error){
        console.log(error);
    }
}
connection();

module.exports = sequelize;