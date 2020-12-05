export class PassengerModel {
  constructor(summonFrom, travelTo, position, passengerName, direction) {
    this.summonFrom = summonFrom; // from which floor
    this.travelTo = travelTo; // to which floor
    this.position = position; // position of the passenger {OTF: On the floor, ITL: In the lift}
    this.passengerName = passengerName; //passenger name will be calculated as Passenger - 1,  Passenger - 1,
    this.direction = direction; // UP or DOWN direction
  }
}
