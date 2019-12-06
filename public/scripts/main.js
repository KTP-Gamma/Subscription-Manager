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
			
			
			$("#firebaseui-auth-container").hide();
		} else {
			// User is signed out.
			console.log("There is no user.  Nobody is signed in.");
			// $("#emailPassword").hide();  // Turned off for now.
			$("#firebaseui-auth-container").show();
			// $("#userInfo").hide();
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
	rh.beginAuthListening();
	rh.startFirebaseUi();

	$("#signOut").click((event) => {
		firebase.auth().signOut()
	});
});