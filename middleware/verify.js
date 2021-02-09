const jwt = require('jsonwebtoken');
const dotenv =  require('dotenv');
dotenv.config();
// middleware function
const verify = (req, res, next)=> {
    const token = req.header('token');
    if (!token) { return res.json({
        access : 'denied',
        token : 'required'})};

    try {
        if(req.isAuthenticated){
        const verify = jwt.verify(token,process.env.SECRET);
        req.user = verify;
        next();
    }else(
     res.send({
         status : '0',
         message : 'failure',
         data : 'unauthorized user'
     })
    )
    } catch (err) {
        return res.send({
            status : '0',
            message : 'failure',
            data : err
        });
    }
} 
module.exports = verify ;