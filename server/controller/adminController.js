const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../firebase");

const createAdmin = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing userName or password" });
    }

    const existing = await db
      .collection("admin")
      .where("userName", "==", userName)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res
        .status(409)
        .json({ success: false, message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = {
      userName,
      password: hashedPassword,
      userType: "admin",
      createdAt: new Date(),
    };

    const docRef = await db.collection("admin").add(admin);

    return res.status(201).json({
      success: true,
      message: "Admin created",
      id: docRef.id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const adminLogin = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields",
    });
  }

  try {
    const snapshot = await db
      .collection("admin")
      .where("userName", "==", userName)
      .where("userType", "==", "admin")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res
        .status(401)
        .json({ success: false, message: "Admin not found" });
    }

    const adminDoc = snapshot.docs[0];
    const admin = adminDoc.data();

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.json({ success: false, message: "JWT_SECRET is not defined" });
    }

    const token = jwt.sign(
      {userType: admin.userType},
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Admin login successful",
      adminId: adminDoc.id,
      user: {
        id: adminDoc.id,
        userName: admin.userName,
        userType: admin.userType,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const isAuthenticated = async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json({ success: false, message: "User not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({
      success: true,
      message: "User is authenticated",
      userId: decoded.id,
      isAdmin: decoded.isAdmin || false, // <-- send isAdmin back!
    });
  } catch (error) {
    return res.json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = { adminLogin, createAdmin, isAuthenticated };
