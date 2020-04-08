import * as firebase from 'firebase';
import DataSnapshot = firebase.database.DataSnapshot;

export const readFullStorage = () => {
    firebase.database().ref('/users').once('value').then(function (snapshot: DataSnapshot) {
        console.log(', snapshot.val()', snapshot.val(), username)
    })
};
