/**
 * Patrick Schemering
 * DEPENDANCIES: node-XMLHttpRequest (Get: npm i xmlhttprequest)
 * WMATA API - Bus Positions
 * Data set from:   https://developer.wmata.com/docs/services/54763629281d83086473f231/operations/5476362a281d830c946a3d68#BusPosition

 */


let data;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
        data = JSON.parse(this.responseText);
        console.log(`Received data: ${JSON.stringify(data)}`)
        console.log("Performing queries......\n\e");
        queries(data);
    }
};


const apiKey = "b50ae5be27744b0a9a8d2935ddd3805d";
const url = "https://api.wmata.com/Bus.svc/json/jBusPositions?"
const params = "";
xhttp.open("GET", url + params + "api_key=" + apiKey, true);
xhttp.send();


class Question {

    constructor(data, text, ... query) {
        this.data = data;
        this.text = text;
        this.query = query;
    }


    getResults() {
        let ret = [];
        let x;
        for (x in data.BusPositions) {
            let y = 0;
            while (y < this.query.length && eval(this.query[y]) === true) y++;
            if (y === this.query.length) ret.push(x);
        }
        return ret;
    }


    print() {

        let BUS_INFO = (x) =>
            "\tBus: " + this.data.BusPositions[x].VehicleID +
            "\ton Route: " + this.data.BusPositions[x].RouteID +
            "\tDestination: " + this.data.BusPositions[x].TripHeadsign;

        let ret = (this.text + "\n");
        let result = this.getResults();
        ret = ret.concat(`Returned ${result.length} results\n`);
        for (let val of result) ret = ret.concat("\n" + BUS_INFO(val));
        return ret;
    }
}

function queries(data = "Unavailable") {
    const line_break = () =>
        console.log("\n\n\t--------------------\n\n");

    let q_number = 1;
    let results = new Map();

    let q = new Question(data,
        "Buses that are on time",
        "this.data.BusPositions[x].Deviation === 0");
    results.set(q_number++, q.print());

        q = new Question(data,
        "Buses that are more than 5 minutes early",
        "this.data.BusPositions[x].Deviation < -5");
    results.set(q_number++, q.print());


    q = new Question(data,
        "Buses that are more than 10 minutes late",
        "this.data.BusPositions[x].Deviation > 10");
    results.set(q_number++, q.print());


    // Washington Monument coords 38.889484, -77.035278.
    // 1 mile = Lat(1 / 60), Lon(1 / 60)
    const WASH_MONUMENT_LAT = 38.889484;
    const WASH_MONUMENT_LON = -77.035278;
    q = new Question(data,
        "Buses within 1 mile of the Washington Monument and heading east:",
       "Math.abs((" + WASH_MONUMENT_LAT + " - data.BusPositions[x].Lat) ) <= 1.0 / 60",
            "Math.abs((" + WASH_MONUMENT_LON + " - data.BusPositions[x].Lon) ) <= 1.0 / 60",
            "data.BusPositions[x].DirectionText === 'EAST'");
    results.set(q_number++, q.print());


    q = new Question(data,
        "Buses headed to Capital Plaza",
        'this.data.BusPositions[x].TripHeadsign === "capital plaza".toUpperCase()');
    results.set(q_number++, q.print());


    q = new Question(data,
        "Buses on any 10A route headed south",
        "this.data.BusPositions[x].DirectionText === 'SOUTH'",
        "this.data.BusPositions[x].RouteID === '10A'");
    results.set(q_number++, q.print());


    const MY_LAT = 38.96;
    const MY_LON = -77.36;
    q = new Question(data,
        "Buses near Reston, VA",
        "Math.abs((" + MY_LAT + " - data.BusPositions[x].Lat) ) <= 10.0 / 60",
        "Math.abs((" + MY_LON + " - data.BusPositions[x].Lon) ) <= 10.0 / 60");
    results.set(q_number++, q.print());


    let max_south = data.BusPositions[0].Lat;
    for (x in data.BusPositions)
        if (data.BusPositions[x].Lat < max_south)
            max_south = data.BusPositions[x].Lat;
    q = new Question(data,
        "Current bus furthest south",
        `this.data.BusPositions[x].Lat === ${max_south}`);
    results.set(q_number++, q.print());


    for (let key of results) {
        console.log(`Query ${key}`);// ${results[key]}`);
        line_break();
    }


}
