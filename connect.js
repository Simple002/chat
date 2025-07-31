const { default: mongoose } = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("✅ MongoDB подключена успешно");

  } catch (err) {
    console.error("❌ Ошибка подключения к MongoDB:", err.message);
    process.exit(1); 
  }
}

module.exports = connectDB