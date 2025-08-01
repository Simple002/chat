const express = require("express")
const { default: mongoose } = require("mongoose")
const app = express()
require("dotenv").config()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const http = require("http").createServer(app);
const { Server } = require('socket.io');
const connectDB = require("./connect")
const io = new Server(http); 
const User = require('./Models/user_model')
const Auth = require("./middlewares/Auth")

connectDB()
app.use(express.json())
app.set("view engine","ejs")
app.use(express.urlencoded({extends:true}))
app.use(express.static("public"));
app.use(cookieParser());

app.get('/',(req,res)=>{
  res.render("index")
})

app.get('/home/chat', Auth, (req, res) => {
  res.render("home", { user: req.user }) // req.user.name доступен в шаблоне
})

app.get('/logout',(req,res)=>{
  res.clearCookie('token')
  res.json({status:true})
})

app.get('/check/user',async (req,res)=>{
  const token = req.cookies.token;

  if(!token){
    return res.json({status:false})
  }

  try{
    const valid = jwt.verify(token,process.env.SECRET_KEY)
    res.json({status:true})
  }catch{
    res.json({status:false})
  }

})

app.post('/create/user', async (req,res)=>{
  const {name,password} = req.body
  
  try{
    const find_user = await User.findOne({name:name})
    if(find_user){
      return res.send("Пользаватель уже есть")
    }

    const hash = await bcrypt.hash(password,10)

    const user = new User({name,password:hash})
    await user.save()

    const token = jwt.sign({name:name},process.env.SECRET_KEY,{expiresIn:"7d"})

    res.cookie("token",token,{
      httpOnly:true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.redirect('/home/chat')

  }catch{
    console.log("ERROR SERVER")
  }
})

app.post('/login/user', async (req,res)=>{
  const {name,password} = req.body
  const find_user = await User.findOne({name:name})

  if(!find_user){
    return res.redirect('/login/user')
  }

  try{
    const check_hash = await bcrypt.compare(password,find_user.password)
    const token = jwt.sign({name:name},process.env.SECRET_KEY,{expiresIn:"7d"})
    res.cookie('token',token,{
      httpOnly:true,
      maxAge: 7 * 24 * 60 * 60 * 1000      
    })
    res.redirect('/home/chat')
  }catch{
    res.redirect('/login/user')
  }
})

app.get('/login/user',(req,res)=>{
  res.render("login")
})




io.on('connection', (socket) => {
  console.log('🔌 Пользователь подключился');

  socket.on('chat message', (data) => {
    io.emit('chat message', {
      user: data.user,
      message: data.message
    });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Пользователь отключился');
  });
});





http.listen(8080 ,()=> {
  console.log("Server start work on port 8080...")
})