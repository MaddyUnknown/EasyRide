import { asycWait } from "./commonUtils";

class FetchUtils {
    static async fetchListOfBusDetails(boardingPoint, droppingPoint, boardingDate) {
        // const data = await fetch('https://0e39c890-189e-4aa1-87c1-df76d74c963c.mock.pstmn.io/search/bus').then(data => data.json());
        // return data;
        await asycWait(500);
        return JSON.parse('[{"id":"B456","name":"Sonali Sleeper Volvo (2+1) AC","seatConfigName":"Volvo Meteor 9600 (2+1)","rating":4.5,"reviews":230,"boardingTime":"2024-07-31T14:47:46.000Z","droppingTime":"2024-08-01T12:47:46.000Z","boardingPoint":"Kolkata","droppingPoint":"Tenzing Norgay Bus Terminus","minCost":2300,"availableSeat":12},{"id":"B457","name":"Sonali Sleeper Volvo (2+1) AC","seatConfigName":"Tata Meteor 1600 (sleeper+seater)","rating":3.5,"reviews":600,"boardingTime":"2024-07-31T14:50:06.000Z","droppingTime":"2024-08-01T12:48:46.000Z","boardingPoint":"Kolkata","droppingPoint":"Tenzing Norgay Bus Terminus","minCost":1600,"availableSeat":32}]');
    }

    static async fetchBusSeatConfigDetails(busId) {
        await asycWait(500);
        
        return [
            { X:0, Y:0, Z:'L', type: 'seater', price: 345, gst: 48, seatId: 'B-1'},
            { X:0, Y:1, Z:'L', type: 'seater'},
            { X:0, Y:2, Z:'L', type: 'seater'},
            { X:0, Y:3, Z:'L', type: 'seater'},
            { X:0, Y:4, Z:'L', type: 'seater', isBooked: true},
            { X:0, Y:5, Z:'L', type: 'seater'},
            { X:0, Y:6, Z:'L', type: 'seater'},
            { X:0, Y:7, Z:'L', type: 'seater'},
            { X:0, Y:8, Z:'L', type: 'seater'},
            { X:0, Y:9, Z:'L', type: 'seater'},
            { X:0, Y:10, Z:'L', type: 'seater'},
            { X:0, Y:11, Z:'L', type: 'seater'},
            { X:0, Y:12, Z:'L', type: 'seater'},
            { X:0, Y:13, Z:'L', type: 'seater'},
            { X:0, Y:14, Z:'L', type: 'sleeper', spanY: 2},
            { X:1, Y:0, Z:'L', type: 'seater'},
            { X:1, Y:1, Z:'L', type: 'seater'},
            { X:1, Y:2, Z:'L', type: 'seater'},
            { X:1, Y:3, Z:'L', type: 'seater'},
            { X:1, Y:4, Z:'L', type: 'seater'},
            { X:1, Y:5, Z:'L', type: 'seater'},
            { X:1, Y:6, Z:'L', type: 'seater'},
            { X:1, Y:7, Z:'L', type: 'seater'},
            { X:1, Y:8, Z:'L', type: 'seater'},
            { X:1, Y:9, Z:'L', type: 'seater'},
            { X:1, Y:10, Z:'L', type: 'seater'},
            { X:1, Y:11, Z:'L', type: 'seater'},
            { X:1, Y:12, Z:'L', type: 'seater'},
            { X:1, Y:13, Z:'L', type: 'seater'},
            { X:1, Y:14, Z:'L', type: 'sleeper', spanY: 2, isBooked: true},
            { X:3, Y:0, Z:'L', type: 'seater'},
            { X:3, Y:1, Z:'L', type: 'seater'},
            { X:3, Y:2, Z:'L', type: 'seater'},
            { X:3, Y:3, Z:'L', type: 'seater'},
            { X:3, Y:4, Z:'L', type: 'seater'},
            { X:3, Y:5, Z:'L', type: 'seater'},
            { X:3, Y:6, Z:'L', type: 'seater'},
            { X:3, Y:7, Z:'L', type: 'seater'},
            { X:3, Y:8, Z:'L', type: 'seater'},
            { X:3, Y:9, Z:'L', type: 'seater'},
            { X:3, Y:10, Z:'L', type: 'seater'},
            { X:3, Y:11, Z:'L', type: 'seater'},
            { X:3, Y:12, Z:'L', type: 'seater'},
            { X:3, Y:13, Z:'L', type: 'seater'},
            { X:3, Y:14, Z:'L', type: 'sleeper', spanY: 2},
            { X:0, Y:14, Z:'U', type: 'sleeper', spanY: 2},
            { X:1, Y:14, Z:'U', type: 'sleeper', spanY: 2},
            { X:3, Y:14, Z:'U', type: 'sleeper', spanY: 2, price: 1345, gst: 188, seatId: 'S-1'}
        ]
    }
}

export { FetchUtils };