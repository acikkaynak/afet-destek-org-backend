const functions = require("firebase-functions");
const fetch = require("node-fetch");

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();

const db = getFirestore();

exports.registerUser = functions.auth.user().onCreate(async (user) => {
    const usersCollection = db.collection('users');

    const userDoc = await usersCollection.doc(user.uid).get();
    if (userDoc.exists) {
        return;
    }

    const { uid, phoneNumber } = user;

    return usersCollection.doc(user.uid).set({
        uid,
        phoneNumber,
        isSuspended: false,
        deletedAt: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });
});

exports.onUserUpdate = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        const { userId } = context.params;
        const { isSuspended } = change.after.data();

        const userRecord = await admin.auth().getUser(userId);
        const { disabled } = userRecord;

        if (isSuspended !== disabled) {
            await admin.auth().updateUser(userId, { disabled: isSuspended });
        }
    });

exports.onDemandCreate = functions.firestore
    .document('demands/{docId}')
    .onCreate(async (snap) => {
        const url = 'https://httpbin.org/post'
        const demand = snap.data();
        const response = await fetch(url, { method: 'POST', body: demand })
        const data = await response.json()
        console.log(data);
    });