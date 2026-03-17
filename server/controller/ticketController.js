const db = require("../firebase");
const crypto = require("crypto");

const ticketsCollection = db.collection("tickets");
const archiveCollection = db.collection("archivedTickets");

// POST ticket
const createTicket = async (req, res) => {
  const id = crypto.randomUUID();
  try {
    const { buyerName, storeName, giantQty, titanQty } = req.body;

    if (giantQty == 0 || titanQty == 0) {
      return res.status(400).json({
        message: "giantQty and titanQty cannot both be zero"
      });
    }

    const ticket = {
      buyerName: buyerName,
      storeName: storeName || null,
      giantQty,
      titanQty,
      createdAt: new Date(),
      ticketId: id,
    };

    const doc = await ticketsCollection.add(ticket);

    res.status(201).json({
      message: "Ticket created",
      id: doc.id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//GET all
const getAllTickets = async (req, res) => {
  try {
    const snapshot = await ticketsCollection.get();

    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(tickets);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// READ single ticket
const getSingleTicket = async (req, res) => {
  try {
    const doc = await ticketsCollection.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE ticket
/*router.put("/:id", async (req, res) => {
  try {
    await ticketsCollection.doc(req.params.id).update(req.body);

    res.json({
      message: "Ticket updated"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});*/

// DELETE ticket
const deleteTicket =  async (req, res) => {
  try {
    await ticketsCollection.doc(req.params.id).delete();

    res.json({
      message: "Ticket deleted"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ARCHIVE ticket
const archive = async (req, res) => {
  try {
    const docRef = ticketsCollection.doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const data = doc.data();

    await archiveCollection.add({
      ...data,
      archivedAt: new Date()
    });

    await docRef.delete();

    res.json({
      message: "Ticket archived"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET archived tickets
const getAllArchivedTickets =  async (req, res) => {
  try {
    const snapshot = await archiveCollection.get();

    const archived = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(archived);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {createTicket, getAllTickets, getSingleTicket, deleteTicket, archive, getAllArchivedTickets};