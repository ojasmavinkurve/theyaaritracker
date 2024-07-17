//const pickup = require("../../routes/pickup");

//initialising io - function request goes to the backend
const socket=io();

//getting username
var username;
var drivercoord;
    fetch('/username', {
        method: 'GET',
        credentials: 'include' // Include cookies in the request
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        username = data.username;
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

//getting a map and centering the view (coords,zoom)
const map=L.map("map").setView([17.98384, 79.5308],20);

//showing particular tiles of the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution: "Yaari Tracker"
}).addTo(map);

//creating icon for driver
const caricon= L.icon({
    iconUrl: '/images/caricon.png',
    iconSize:[50,32],
    iconAnchor: [25,16]
});
const studenticon= L.icon({
    iconUrl: '/images/student.png',
    iconSize:[50,32],
    iconAnchor: [25,16]
});

//creating empty object marker
const studentMarker={};
const driverMarker={};
var pickupMarker=null;
//getting the data sent from backend and displaying on the map

//checking if geolocation is available in the device
if(navigator.geolocation){
    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            //sending the coords in the form of an event
            socket.emit("student-location", {username,latitude,longitude});
        },
        //error incase of unavalaibility of position
        (error) =>{
            console.error(error);
        },
        //settings
        {
            enableHighAccuracy: true,
            timeout: 2000,
            maximumAge:0, //to avoid caching
        }
    );

    
};

socket.on("update-student-location", (coords)=>{
    //extracting the data
    const{id,latitude,longitude}= coords;
    //console.log(coords);
    //if(username===coords.username){
        //sending the user coords to the map
    map.setView([latitude,longitude],20);
    //if marker has an id then set the lat lag 
    if(studentMarker[id]){
        studentMarker[id].setLatLng([latitude,longitude]);
    }
    //else creating marker at the point
    else{
        studentMarker[id]= L.marker([latitude,longitude],{icon: studenticon}).addTo(map);
    }
});


//adding event listener to add student pick up point to the map
document.addEventListener('DOMContentLoaded', function() {
    // Function to update marker's position on the server
    function updateServerWithMarkerPosition() {
        const position = pickupMarker.getLatLng();
        socket.emit('student-pickup', {//sends pickup location to the server
            username: username,
            latitude: position.lat,
            longitude: position.lng
        });
    }

    // Add a marker when clicking on the map
    map.on('click', function(e) {
        if (!pickupMarker) {
            //add marker to map
            pickupMarker = L.marker(e.latlng, {draggable: true}).addTo(map);

            //send pickup position to server
            updateServerWithMarkerPosition();

            //if dragged, update
            pickupMarker.on('dragend', function() {
                updateServerWithMarkerPosition();
            });
        } else {
            // update marker position if alr exists
            pickupMarker.setLatLng(e.latlng);
            updateServerWithMarkerPosition();
        }
    });

});


//updating drivers location on student side
socket.on("update-driver-location", function(coords){
const{id,latitude,longitude}= coords;
map.setView([latitude,longitude],20);
//drivercoord={latitude,longitude};
if(driverMarker[id]){
    driverMarker[id].setLatLng([latitude,longitude]);
}
else{
    driverMarker[id]= L.marker([latitude,longitude],{icon: caricon}).addTo(map);
}
});

const passenger={}
const pickupIcon= L.icon({
    iconUrl: '/images/pickupicon.png',
    iconSize:[50,32],
    iconAnchor: [25,16]
});

//passenger pickup points are seen by other students
// socket.on("new-pickup-point", function(coords){
//     //extracting the data
//     const{username,latitude,longitude}= coords;
//     console.log(coords);
//     console.log(username);
//     if(coords.username!==username){
//         console.log("entered");
//         //sending the user coords to the map
//     map.setView([latitude,longitude],20);
//     //if marker has an id then set the lat lag 
//     if(passenger[username]){
//         passenger[username].setLatLng([latitude,longitude]);
//     }
//     //else creating marker at the point
//     else{
//         passenger[username]= L.marker([latitude,longitude],{icon:pickupIcon}).addTo(map);
//     }
//     }
    
// });

// //when user disconnects
// socket.on("user-disconnect", function(id){
//     if(studentMarker[id]){
//         map.removeLayer(studentMarker[id]);
//         delete studentMarker[id];
//     }
// });

// document.addEventListener('visibilitychange', function() {
//     if (document.visibilityState === 'hidden') {
//       // User has closed the tab or switched to another tab
//         if(studentMarker[id]){
//         map.removeLayer(studentMarker[id]);
//         delete studentMarker[id];
//         }
//         if(pickupMarker) pickupMarker
//       socket.emit('disconnect', username);
//     }
//   });

  // When user disconnects
socket.on("user-disconnect", function (id) {
    if (studentMarker[id]) {
        map.removeLayer(studentMarker[id]);
        delete studentMarker[id];
    }
});

// // Add window unload event listener to disconnect user
// window.addEventListener('beforeunload', function () {
//     disconnectUser(username);
// });

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        disconnectUser(username);
    }
  });

function disconnectUser(username) {
    socket.emit("user-disconnect", username);
}