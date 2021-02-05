const {Sequelize} = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME,process.env.USER_NAME,process.env.PASSWORD,{
    host : 'localhost', 
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