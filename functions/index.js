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
    const timestamp = admin.database.ServerValue.TIMESTAMP;
    snapshot.ref.child('receiveTIme').set(timestamp);

    // Create a notification
    const payload = {
        notification: {
            title: "Paket Baru",
            body: "Ada paket baru tiba di box Tepav-mu nih",
            sound: "default"
        }
    };

    //Create an options object that contains the time to live for the notification and the priority
    const options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };

    return admin.messaging().sendToTopic("channelMain", payload, options);
});

exports.sterilizedPacket = functions.database.ref('/packet/{pushId}').onUpdate((change, context) => {
    //console.log('Push notification event triggered');

    //  Get the current value of what was written to the Realtime Database.
    const valueObject = change.after.val(); 
    const timestamp = admin.database.ServerValue.TIMESTAMP;

    if (valueObject.status == "cleaning") {
        snapshot.ref.child('cleaningTime').set(timestamp);
    } else if (valueObject.status == "sterilized") {
        snapshot.ref.child('sterilizedTime').set(timestamp);
    }

    // Create a notification
    const payload = {
        notification: {
            title: "Sterilisasi Selesai",
            body: "Paket Anda telah selesai disterilisasi, silahkan ambil di box Tepav-mu",
            sound: "default"
        }
    };

    //Create an options object that contains the time to live for the notification and the priority
    const options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };

    if (valueObject.hasOwnProperty('sterilizedTime')){
        return admin.messaging().sendToTopic("channelMain", payload, options);
    }
});
