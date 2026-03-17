const db = require("../firebase");

const adminCollection = db.collection("admin");

module.exports = {
  create: async (admin) => {
    const docRef = await adminCollection.add(admin);
    return { id: docRef.id, ...admin };
  },

  findOneByUserName: async (userName) => {
    const snapshot = await adminCollection
      .where("userName", "==", userName)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },
};
