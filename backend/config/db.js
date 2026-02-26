const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`
=================================
🟢  DATABASE STATUS: CONNECTED
📦  Host: ${conn.connection.host}
=================================
`);
  } catch (error) {
    console.log(`
=================================
🔴  DATABASE STATUS: FAILED
=================================
`);
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
