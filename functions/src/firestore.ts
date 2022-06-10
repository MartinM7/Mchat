import * as functions from "firebase-functions";
import * as admin from "firebase-admin";


admin.initializeApp();
const db = admin.firestore();

export const addCountersToUserDocument = functions.firestore
    .document("users/{user}")
    .onCreate( async (snapshot) => {
      const documentId = snapshot.id;

      const userRef = db.doc(`users/${documentId}`);

      await userRef.update({
        chatCount: 0,
        messageCount: 0,
      });
    });

export const messageCount = functions.firestore
    .document("chats/{chat}/messages/{message}")
    .onCreate(async (snapshot) => {
      const data = snapshot.data();

      const userRef = db.doc(`users/${data.sender.uid}`);

      await userRef.update(
          {messageCount: admin.firestore.FieldValue.increment(1)}
      );
    });

export const chatCount = functions.firestore
    .document("chats/{chat}")
    .onCreate(async (snapshot) => {
      const data = snapshot.data();

      const userRef = db.doc(`users/${data.owner}`);

      await userRef.update(
          {chatCount: admin.firestore.FieldValue.increment(1)}
      );
    });
