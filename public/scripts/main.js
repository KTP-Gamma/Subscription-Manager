/**
 * @fileoverview
 * Provides interactions for all pages in the UI.
 *
 * @author Steven Jung
 */

/** namespace. */
var rh = rh || {};
var db = firebase.firestore();


/** globals */
rh.COLLECTION_USER = "UsersData";
rh.COLLECTION_SUBSCRIPTIONS = "Subscriptions";
rh.KEY_NAME = "name";
rh.KEY_COST = "cost";
rh.KEY_TYPE = "type";
rh.KEY_RENEWAL = "renewal";
rh.KEY_LAST_TOUCHED = "lastTouched";
rh.KEY_UID = "uid";
rh.GLOBAL_UID = "";

rh.ROSEFIRE_REGISTRY_TOKEN = "d1dc1ee8-f6ee-4b3c-b195-fa756042fdce";

rh.fbSubscriptionManager = null;
rh.fbAuthManager = null;
rh.fbSingleSubscriptionManager = null;

rh.Subscription = class {
	constructor(id, name, cost) {
		this.id = id;
		this.name = name;
		this.cost = cost;
	}
}

rh.FbSubscriptionManager = class {
	constructor(uid) {
		this._ref = db.collection(rh.COLLECTION_USER).doc(uid).collection(rh.COLLECTION_SUBSCRIPTIONS);
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

	add(name, cost, type) {
		this._ref.add({
			[rh.KEY_NAME]: name,
			[rh.KEY_COST]: cost,
			[rh.KEY_TYPE]: type,
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

		var subType = "Monthly";
		$("#submitAddSub").click((event) => {
			const name = $("#inputName").val();
			const cost = $("#inputCost").val();
			const type = subType;
			console.log("name:", name);
			console.log("cost", cost);
			console.log("type", type);
			rh.fbSubscriptionManager.add(name, cost, type);
			$("#inputName").val("");
			$("#inputCost").val("");
		});

		$("#monthlyDropdown").click((event) => {
			console.log("Clicked monthly");
			subType = "Monthly";
		})

		$("#annuallyDropdown").click((event) => {
			console.log("Clicked annually");
			subType = "Annually";
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
			window.location.href = `/detail.html?id=${subscription.id}`;
		});
		return $newCard;
	}
}

rh.ChartPageController = class {
	constructor() {
		rh.fbSubscriptionManager.beginListening(this.updateView.bind(this));

		$("#menuSignOut").click((event) => {
			rh.fbAuthManager.signOut();
		})

	}
	
	updateView() {
		updateChartVals();
		renderPieChart(pieChartValues);
	}
}

var pieChartValues = [{
    y: 39.16,
    exploded: true,
    indexLabel: "Hello",
    color: "#1f77b4"
}
];

function updateChartVals() {
    var curSub;
    var subs = [];
	var total = 0;
	debugger;
    for (let i = 0; i < rh.fbSubscriptionManager.length; i++) {
        curSub = rh.fbSubscriptionManager.getSubscriptionAtIndex(k);
        subs.push(curSub);
        total += curSub.cost;
    }
    console.log(total);
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

rh.FbSingleSubscriptionManager = class {
	constructor(subscriptionId) {
		this._ref = db.collection(rh.COLLECTION_USER).doc(rh.GLOBAL_UID).collection(rh.COLLECTION_SUBSCRIPTIONS).doc(subscriptionId);
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
				console.log('Document does not exits',doc);
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	update(name, cost, type) {
		this._ref.update({
			[rh.KEY_NAME]: name,
			[rh.KEY_COST]: cost,
			[rh.KEY_TYPE]: type,
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

	get type() {
		return this._document.get(rh.KEY_TYPE);
	}
}

rh.DetailPageController = class {
	constructor() {
		rh.fbSingleSubscriptionManager.beginListening(this.updateView.bind(this));
		$("#editSubDialog").on("show.bs.modal", function (e) {
			$("#inputQuote").val(rh.fbSingleSubscriptionManager.quote);
			$("#inputMovie").val(rh.fbSingleSubscriptionManager.movie);
		});

		$("#editSub").on("shown.bs.modal", function (e) {
			$("#inputQuote").trigger("focus");
		});

		var subTypeEdit = "Monthly";
		$("#monthlyDropdownEdit").click((event) => {
			console.log("Clicked monthly");
			subTypeEdit = "Monthly";
		})

		$("#annuallyDropdownEdit").click((event) => {
			console.log("Clicked annually");
			subTypeEdit = "Annually";
		})

		$("#submitEditSub").click((event) => {
			const name = $("#inputQuote").val();
			const cost = $("#inputMovie").val();
			const type = subTypeEdit;
			rh.fbSingleSubscriptionManager.update(name, cost, type);
		});

		$("#delete").click((event) => {
			rh.fbSingleSubscriptionManager.delete().then(() => {
				window.location.href = "/";
			});
		});

		$("#menuSignOut").click((event) => {
			rh.fbAuthManager.signOut();
		});

	}

	updateView() {
		$("#cardName").html(rh.fbSingleSubscriptionManager.name);
		$("#cardCost").html(`Cost: ${rh.fbSingleSubscriptionManager.cost}$`);
		$("#cardType").html(`Type: ${rh.fbSingleSubscriptionManager.type}`);

		//Show edit and delete if allowed
		// if (rh.fbSingleSubscriptionManager.uid == rh.fbAuthManager.uid) {
		// 	$("#menuEdit").show();
		// 	$("#menuDelete").show();
		// }
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
		rh.GLOBAL_UID = this.fbAuthManager._user.uid;
		console.log("On the main page");
		const urlUid = urlParams.get('uid');
		//console.log(this.fbAuthManager)
		rh.fbSubscriptionManager = new rh.FbSubscriptionManager(rh.GLOBAL_UID);
		new rh.ListPageController();
	} else if ($("#detail-page").length) {
		rh.GLOBAL_UID = this.fbAuthManager._user.uid;
		console.log("On the detail page");
		// const movieQuoteId = rh.storage.getMovieQuoteId();
		// var urlParams = new URLSearchParams(window.location.search);
		const subId = urlParams.get('id');
		if (subId) {
			rh.fbSingleSubscriptionManager = new rh.FbSingleSubscriptionManager(subId);
			new rh.DetailPageController();
		} else {
			console.log("Missing a id");
			// window.location.href = "/";
		}
	} else if ($("#login-page").length) {
		console.log("On the login Page");
		new rh.LoginPageController();
	} else if ($("#chart-page").length) {
		rh.GLOBAL_UID = this.fbAuthManager._user.uid;
		console.log("On the chart page");
		new rh.ChartPageController();
	}

}

function renderPieChart(values) {

    var chart = new CanvasJS.Chart("pieChart", {
        backgroundColor: "#DDDDDD",
        colorSet: "colorSet2",

        title: {
            text: "Subscription Breakdown",
            fontFamily: "Comic Sans MS",
            fontSize: 25,
            fontWeight: "normal",
        },
        animationEnabled: true,
        data: [{
            indexLabelFontSize: 15,
            indexLabelFontFamily: "Comic Sans MS",
            indexLabelFontColor: "darkgrey",
            indexLabelLineColor: "darkgrey",
            indexLabelPlacement: "outside",
            type: "pie",
            showInLegend: false,
            toolTipContent: "<strong>#percent%</strong>",
            dataPoints: values
        }]
    });
    chart.render();
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