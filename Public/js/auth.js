
function validAccountCheck() {
    var user = firebase.auth().currentUser;
    return firebase.firestore().collection('users').doc(user.uid).get().then(function (querySnapshot) {
        if (!querySnapshot.exists) {
            return querySnapshot.ref.set({
                'displayName': user.displayName,
                'email': user.email,
                'photoURL': user.photoURL,
                'gender': '',
                'insertDateTime': firebase.firestore.FieldValue.serverTimestamp()
            }, {
                merge: true
            }).then(() => {
                return true;
            }).catch((err) => { // Not a while-listed domain
                //console.log(err);
                return false;
            });
        }else{
            return true;
        }
    }).catch((err) => { // Not a while-listed domain
        //console.log(err);
        return false;
    });
}