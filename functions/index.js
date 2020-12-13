const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

//import admin module
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.newPacket = functions.database.ref('/packet/{pushId}').onCreate((snapshot, context) => {
    //console.log('New packet event triggered');

    const original = snapshot.val();
    //const uid = context.auth.uid;
    //snapshot.ref.child('user').set(uid);
    // const timestamp = admin.database.ServerValue.TIMESTAMP;
    const time = new Date().toISOString();

    // Create a notification
    var message = {
        notification: {
            title: "Paket Baru",
            body: "Ada paket baru tiba di box Tepav-mu nih",
            sound: "default"
        },
        topic: 'channelMain'
    }

    return admin.messaging().send(message).then(() => {
        return snapshot.ref.child('receiveTime').set(time);
    })
});

exports.sterilizedPacket = functions.database.ref('/packet/{pushId}').onUpdate((change, context) => {
    //console.log('Push notification event triggered');

    //  Get the current value of what was written to the Realtime Database.
    const valueObject = change.after.val(); 
    // const timestamp = admin.database.ServerValue.TIMESTAMP;
    const time = new Date().toISOString();
    // console.log(time);
    // console.log(valueObject.status);

    // Create a notification
    var message = {
        notification: {
            title: "Sterilisasi Selesai",
            body: "Paket Anda telah selesai disterilisasi, silahkan ambil di box Tepav-mu",
            sound: "default"
        },
        topic: 'channelMain'
    }

    if (valueObject.status === "cleaning") {
        // console.log("Cleaning");
        if (!valueObject.hasOwnProperty('cleaningTime')){
            return change.after.ref.child('cleaningTime').set(time);
        }
    } else if (valueObject.status === "sterilized") {
        // console.log("Sterilized");
        if (!valueObject.hasOwnProperty('sterilizedTime')){
            return admin.messaging().send(message).then(() => {
                return change.after.ref.child('sterilizedTime').set(time);
            })
        }
    }

    return true;
});
