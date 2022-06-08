import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const messageCount = functions.firestore
    .document("chats/{chat}/messages/{message}")
    .onCreate(async (snapshot) => {
      const data = snapshot.data();

      const userRef = db.doc(`users/${data.sender.uid}`);

      const userSnap = await userRef.get();
      const userData = userSnap.data();

      if (userData?.messageCount) {
        return userRef.update({
          messageCount: userData?.messageCount + 1,
        });
      }

      return userRef.update({
        messageCount: 1,
      });
    });

export const chatCount = functions.firestore
    .document("chats/{chat}")
    .onCreate(async (snapshot) => {
      const data = snapshot.data();

      const userRef = db.doc(`users/${data.owner}`);

      const userSnap = await userRef.get();
      const userData = userSnap.data();

      if (userData?.chatCount) {
        return userRef.update({
          chatCount: userData?.chatCount + 1,
        });
      }

      return userRef.update({
        chatCount: 1,
      });
    });
