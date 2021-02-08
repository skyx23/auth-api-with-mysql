const jwt = require('jsonwebtoken');
const dotenv =  require('dotenv');
dotenv.config();
// middleware function
const verify = (req, res, next)=> {
    const token = req.header('token');
    if (!token) { return res.send('access denied : need to login (login token required)')};

    try {
        const verify = jwt.verify(token,process.env.SECRET);
        req.user = verify;
        next();
    } catch (err) {
        return res.send(err);
    }
} 
module.exports = verify ;