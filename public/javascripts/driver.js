//initialising io - function request goes to the backend
const socket=io();

//checking if geolocation is available in the device
if(navigator.geolocation){
    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            //sending the coords in the form of an event
            socket.emit("driver-location", {latitude,longitude});
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
}

//getting a map and centering the view (coords,zoom)
const map=L.map("map").setView([17.98384, 79.5308],10);
L.control.scale(50).addTo(map);

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

//creating empty object marker
const markers={};

//getting the data sent from backend and displaying on the map
socket.on("update-driver-location", (coords)=>{
    //extracting the data
    const{id,latitude,longitude}= coords;
    //sending the user coords to the map
    map.setView([latitude,longitude],20);
    //if marker has an id then set the lat lag 
    if(markers[id]){
        markers[id].setLatLng([latitude,longitude]);
    }
    //else creating marker at the point
    else{
        markers[id]= L.marker([latitude,longitude],{icon: caricon}).addTo(map);
    }
});

const stu={}
const pickupIcon= L.icon({
    iconUrl: '/images/pickupicon.png',
    iconSize:[50,32],
    iconAnchor: [25,16]
});
//stud pickup
// socket.on("new-pickup-point", function(coords){
//     //extracting the data
//     const{id,latitude,longitude}= coords;
//     //sending the user coords to the map
//     //map.setView([latitude,longitude],20);
//     //if marker has an id then set the lat lag 
//     if(stu[id]){
//         stu[id].setLatLng([latitude,longitude]);
//     }
//     //else creating marker at the point
//     else{
//         stu[id]= L.marker([latitude,longitude]).addTo(map);
//     }
// });

// Create object to store student pickup markers
// Create object to store student pickup markers
let studentMarkers = {};

// Listen for new pickup points from server
socket.on('new-pickup-point', function(pickupPoints) {
    clearStudentMarkers(); // Clear existing student pickup markers

    pickupPoints.forEach(function(point) {
        const { username, latitude, longitude } = point;

        // Ensure latitude and longitude are defined and valid
        if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
            // Display student pickup markers on the map
            if (!studentMarkers[username]) {
                studentMarkers[username] = L.marker([latitude, longitude], { icon: pickupIcon }).addTo(map);
            } else {
                studentMarkers[username].setLatLng([latitude, longitude]);
            }
        } else {
            console.warn(`Invalid coordinates received for username ${username}: Latitude=${latitude}, Longitude=${longitude}`);
        }
    });
});

// Function to clear existing student pickup markers
function clearStudentMarkers() {
    Object.values(studentMarkers).forEach(marker => map.removeLayer(marker));
    studentMarkers = {};
}

// Listen for pickup point deletion
socket.on("pickup-point-deleted", function (data) {
    const { username } = data;
    if (studentMarkers[username]) {
        map.removeLayer(studentMarkers[username]);
        delete studentMarkers[username];
    }
});

//when user disconnects
socket.on("user-disconnect", function(id){
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});