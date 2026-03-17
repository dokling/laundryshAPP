require("dotenv").config();

const express = require("express");
const cors = require("cors");
const ticketRoutes = require("./routes/tickets");
const authRoutes = require("./routes/auth");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/tickets", ticketRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("LaundryshAPP API running");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});