//initialising io - function request goes to the backend
const socket=io();

//checking if geolocation is available in the device
if(navigator.geolocation){
    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            //sending the coords in the form of an event
            socket.emit("send-location", {latitude,longitude});
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
const map=L.map("map").setView([0,0],10);

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
socket.on("recieve-location", (coords)=>{
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
        markers[id]= L.marker([latitude,longitude], {icon: caricon}).addTo(map);
    }
});

//when user disconnects
socket.on("user-disconnect", function(id){
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
