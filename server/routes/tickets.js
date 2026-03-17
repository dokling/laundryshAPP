const express = require("express");
const router = express.Router();
const  {createTicket, getAllTickets, getSingleTicket, deleteTicket, archive, getAllArchivedTickets}  = require("../controller/ticketController");
const userAuth = require('../middleware/userAuth.js');

//add userAuth middleware to all routes except create ticket

// CREATE ticket
router.post("/", createTicket);
//GET all
router.get("/", getAllTickets);
//GET one
router.get("/:id", getSingleTicket);
//DELETE one
router.delete("/:id", deleteTicket);
//ARCHIVE one
router.post("/archived/:id", archive);
//GET all archived
router.get("/archived/all", getAllArchivedTickets);

module.exports = router;