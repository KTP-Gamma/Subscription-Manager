var options = [
    set0 = ['Option 1','Option 2'],
    set1 = ['Netflix','Spotify','iCloud']
];

var dict0 = {
    "Netflix": {
        "SubName" : "Netflix",
        "SubPrice" : "10",
        "SubDuration" : "10",
        "StartDate" : "10/2019"
    },
    
    "Spotify": {
        "SubName" : "Spotify",
        "SubPrice" : "5",
        "SubDuration" : "12",
        "StartDate" : "5/2019"
    },

    "Twitch": {
        "SubName" : "Twitch",
        "SubPrice" : "5",
        "SubDuration" : "1",
        "StartDate" : "8/2019"
    }
}

function makeUL(array) {
// Create the list element:
var list = document.createElement('ul');
list.className = "list-group list-group-flush";

for(var i = 0; i < array.length; i++) {
    // Create the list item:
    var item = document.createElement('li');
    item.className = "list-group-item";
    // Set its contents:
    item.appendChild(document.createTextNode(array[i]));

    // Add it to the list:
    list.appendChild(item);
}

// Finally, return the constructed list:
return list;
}

// Add the contents of options[0] to #foo:
document.getElementById('subs_list').appendChild(makeUL(options[1]));