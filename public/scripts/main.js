/**
 * @fileoverview
 * Provides interactions for all pages in the UI.
 *
 * @author Steven Jung
 */

/** namespace. */
var rh = rh || {};

/** globals */
rh.COLLECTION_SUBSCRIPTIONS = "Subscriptions";
rh.KEY_NAME = "name";
rh.KEY_COST = "cost";
rh.KEY_RENEWAL = "renewal";
rh.KEY_LAST_TOUCHED = "lastTouched";
rh.KEY_UID = "uid";

rh.ROSEFIRE_REGISTRY_TOKEN = "d1dc1ee8-f6ee-4b3c-b195-fa756042fdce";

rh.fbSubscriptionManager = null;
rh.fbAuthManager = null;

rh.Subscription = class {
	constructor(id, name, cost) {
		this.id = id;
		this.name = name;
		this.cost = cost;
	}
}

rh.FbSubscriptionManager = class {
	constructor(uid) {
		this._ref = firebase.firestore().collection(rh.COLLECTION_SUBSCRIPTIONS);
		this._documentSnapshots = [];
		this._unsubscribe = null;
		this._uid = uid;
	}

	beginListening(changeListener) {
		console.log("Listening for movie quotes");
		let query = this._ref.orderBy(rh.KEY_LAST_TOUCHED, "desc").limit(30);
		if (this._uid) {
			query = query.where(rh.KEY_UID, "==", this._uid);
		}

		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			console.log("Update " + this._documentSnapshots.length + " movie quotes");
			// querySnapshot.forEach( (doc) => {
			// 	console.log(doc.data());
			// });
			if (changeListener) {
				changeListener();
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	add(name, cost) {
		this._ref.add({
			[rh.KEY_NAME]: name,
			[rh.KEY_COST]: cost,
			[rh.KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			[rh.KEY_UID]: rh.fbAuthManager.uid
		}).then((docRef) => {
			console.log("Document has been added with id", docRef.id);
		}).catch((error) => {
			console.log("There was an error adding the document", error);
		});
	}
	get length() {
		return this._documentSnapshots.length;
	}

	getSubscriptionAtIndex(index) {
		return new rh.Subscription(
			this._documentSnapshots[index].id,
			this._documentSnapshots[index].get(rh.KEY_NAME),
			this._documentSnapshots[index].get(rh.KEY_COST)
		);
	}
}

rh.ListPageController = class {
	constructor() {
		rh.fbSubscriptionManager.beginListening(this.updateView.bind(this));
	
		$("#menuSignOut").click((event) => {
			rh.fbAuthManager.signOut();
		});

		$("#addSubDialog").on("shown.bs.modal", function (e) {
			$("#inputQuote").trigger("focus");
		});

		$("#submitAddSub").click((event) => {
			const name = $("#inputName").val();
			const cost = $("#inputCost").val();
			console.log("name:", name);
			console.log("cost", cost);
			rh.fbSubscriptionManager.add(name, cost);
			$("#inputName").val("");
			$("#inputCost").val("");
		});

		$("#monthlyDropdown").click((event) => {
			console.log("Clicked monthly")
		})

		$("#annuallyDropdown").click((event) => {
			console.log("Clicked annually")
		})
	}

	updateView() {
		$("#subList").removeAttr("id").hide();
		let $newList = $("<ul></ul>").attr("id", "subList").addClass("list-group");
		for (let k = 0; k < rh.fbSubscriptionManager.length; k++) {
			const $newCard = this.createSubscriptionCard(rh.fbSubscriptionManager.getSubscriptionAtIndex(k));
			$newList.append($newCard);
		}
		$("#subscriptionListContainer").append($newList);
	}

	createSubscriptionCard(subscription) {
		console.log(subscription.id);
		console.log(subscription.name);
		console.log(subscription.cost);
		const $newCard = $(`
		  <li id="${subscription.id}" class="quote-card list-group-item">
		     <div class="">${subscription.name}</div>
		     <div class="text-right">Cost: ${subscription.cost}$</div>
	      </li>`);
		$newCard.click((event) => {
			console.log("You have clicked", subscription);
			// rh.storage.setMovieQuoteId(movieQuote.id);
			window.location.href = `/moviequote.html?id=${subscription.id}`;
		});
		return $newCard;
	}
}

rh.FbAuthManager = class {
	constructor() {
		this._user = null;
	}
	get uid() {
		if (this._user) {
			return this._user.uid;
		}
		console.log("There is no user");
		return "";
	}

	get isSignIn() {
		return !!this._user;
	}

	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}
	signIn() {}
	signOut() {
		firebase.auth().signOut();
	}
}

rh.LoginPageController = class {
	constructor() {
		var ui = new firebaseui.auth.AuthUI(firebase.auth());
		var uiConfig = {
			// signInSuccessUrl: '/',
			signInOptions: [
				firebase.auth.GoogleAuthProvider.PROVIDER_ID,
				firebase.auth.EmailAuthProvider.PROVIDER_ID,
				firebase.auth.PhoneAuthProvider.PROVIDER_ID,
				firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
			],
		};
		ui.start("#firebaseui-auth-container", uiConfig);
	}
}

rh.FbSingleMovieQuoteManager = class {
	constructor(subscriptionId) {
		this._ref = firebase.firestore().collection(rh.COLLECTION_SUBSCRIPTIONS).doc(subscriptionId);
		this._document = {};
		this._unsubscribe = null;
	}

	beginListening(changeListener) {
		console.log("Listening for this movie quote");
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				this._document = doc;
				console.log('doc.data() :', doc.data());
				if (changeListener) {
					changeListener();
				}
			} else {
				// This document does not exist (or has been deleted)
				//window.location.href = "/";
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}
	
	update(name, cost) {
		this._ref.update({
			[rh.KEY_NAME]: name,
			[rh.KEY_COST]: cost,
			[rh.KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now()
		}).then((docRef) => {
			console.log("The update is complete");
		});
	}
	delete() {
		return this._ref.delete();
	}

	get name() {
		return this._document.get(rh.KEY_NAME);
	}

	get cost() {
		return this._document.get(rh.KEY_COST);
	}
}

rh.DetailPageController = class {
	constructor() {
		rh.fbSubscriptionManager.beginListening(this.updateView.bind(this));
		$("#editQuoteDialog").on("show.bs.modal", function (e) {
			$("#inputQuote").val(rh.fbSubscriptionManager.quote);
			$("#inputMovie").val(rh.fbSubscriptionManager.movie);
		});
		$("#editQuoteDialog").on("shown.bs.modal", function (e) {
			$("#inputQuote").trigger("focus");
		});
		$("#submitEditQuote").click((event) => {
			const quote = $("#inputQuote").val();
			const movie = $("#inputMovie").val();
			rh.fbSingleMovieQuoteManager.update(quote, movie);
		});

		$("#deleteQuote").click((event) => {
			rh.fbSingleMovieQuoteManager.delete().then(() => {
				window.location.href = "/";
			});
		});

	}

	updateView() {
		$("#cardQuote").html(rh.fbSingleMovieQuoteManager.quote);
		$("#cardMovie").html(rh.fbSingleMovieQuoteManager.movie);
	}
}

rh.checkForRedirects = function () {
	if ($("#login-page").length && rh.fbAuthManager.isSignIn) {
		window.location.href = "/list.html";
	}
	if (!$("#login-page").length && !rh.fbAuthManager.isSignIn) {
		console.log("not logged in")
		window.location.href = "/";
	}
}

rh.initializePage = function () {
	//Initilization
	var urlParams = new URLSearchParams(window.location.search);
	console.log(urlParams);
	if ($("#list-page").length) {
		console.log("On the main page");
		const urlUid = urlParams.get('uid');
		rh.fbSubscriptionManager = new rh.FbSubscriptionManager(urlUid);
		new rh.ListPageController();
	} else if ($("#login-page").length) {
		console.log("On the login Page");
		new rh.LoginPageController();
	}

}
/* Main */
$(document).ready(() => {
	console.log("Ready");
	rh.fbAuthManager = new rh.FbAuthManager();
	rh.fbAuthManager.beginListening(() => {
		console.log("Auth state changed. isSignedIn = ", rh.fbAuthManager.isSignIn);
		rh.checkForRedirects();
		rh.initializePage();
	})
});