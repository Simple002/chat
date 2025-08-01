require("dotenv").config()
const jwt = require("jsonwebtoken")


async function Auth(req,res,next){
    const auth_token = req.cookies.token
    if(!auth_token){return res.redirect('/login')}

    try{
        const decoded = jwt.verify(auth_token,process.env.SECRET_KEY)
        req.user = decoded
        next()
    }catch{
        res.redirect('/login')
    }
}

module.exports = Auth