/**
 * @fileoverview
 * Provides interactions for all pages in the UI.
 *
 * @author  Steven Jung
 */

/** namespace. */
var rh = rh || {};

rh.beginAuthListening = function () {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user) {
			// User is signed in.
			$("#uid").html(`<b>uid</b>: ${user.uid}`);
			$("#email").html(`<b>email</b>: ${user.email}`);
			$("#displayName").html(`<b>displayName</b>: ${user.displayName}`);
			$("#photoURL").attr("src", user.photoURL);
			$("#phoneNumber").html(`<b>phone #</b>: ${user.phoneNumber}`);
			console.log(user.providerData);
			console.log("A user IS signed in.  Uid = ", user.uid);
			
			$("#firebaseui-auth-container").hide();
			$("#emailPassword").hide();
			$("#userInfo").show();
		} else {
			// User is signed out.
			console.log("There is no user.  Nobody is signed in.");
			$("#firebaseui-auth-container").show();
			$("#userInfo").hide();
		}
	});
}


rh.startFirebaseUi = function () {
	// FirebaseUI config.
	var uiConfig = {
        signInSuccessUrl: '/',
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.PhoneAuthProvider.PROVIDER_ID,
          firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
        ],
      };
      var ui = new firebaseui.auth.AuthUI(firebase.auth());
      ui.start("#firebaseui-auth-container", uiConfig);
}

/* Main */
$(document).ready(() => {
	console.log("Ready");

	rh.startFirebaseUi();

	$("#signOut").click((event) => {
		firebase.auth().signOut()
	});
});