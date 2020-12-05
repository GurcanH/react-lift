import React, { Component } from 'react';

import classes from './Lift.module.css';
import Floors from '../Floors/Floors';
import {
  TRAVEL_TIME,
  WAITING_TIME,
  ON_THE_FLOOR,
  IN_THE_LIFT,
  UP,
  DOWN
} from '../../config/constants';
import { LiftModel } from '../../models/LiftModel';
import { PassengerModel } from '../../models/PassengerModel';

let timer;

const INITIAL_STATE = {
  logs: [],
  showButtons: false,
  lift: {},
  passengers: [],
  passengerName: null,
  passengerCount: 0
};

class Lift extends Component {
  componentDidMount(prevProps) {
    //Create the lift object
    const lift = new LiftModel(0, null);
    this.setState({
      ...prevProps,
      lift
    });
  }

  state = INITIAL_STATE;

  //Add the log into the Logs array in the state
  addLog = (log, style) => {
    const logObj = { log, style };

    this.setState(prevState => ({
      ...prevState,
      logs: [...prevState.logs, logObj]
    }));
  };

  //The passenger get off the lift so it needs to be deleted
  deletePassenger = passengerName => {
    const passengers = [...this.state.passengers].filter(
      passenger => passenger.passengerName !== passengerName
    );
    this.setState(
      prevState => {
        return {
          ...prevState,
          passengers
        };
      },
      () => {
        const passengers = [...this.state.passengers];

        if (passengers.length > 0) {
          // if there are someone else waiting for the lift move on
          const to = !passengers[0].travelTo
            ? passengers[0].summonFrom
            : passengers[0].travelTo;

          this.moveTheLift(to);
        } else {
          this.addLog(
            `No passenger waiting for the lift. The lift has stopped.`,
            'orange'
          );
        }
      }
    );
  };

  // if button did not click, the passenger give up to give in the lift
  // delete the passanger
  buttonDidNotClick = passengerName => {
    const passengers = [...this.state.passengers].filter(
      passenger => passenger.passengerName !== passengerName
    );

    this.setState(
      prevState => {
        return {
          ...prevState,
          passengers,
          passengerName: null,
          showButtons: false
        };
      },
      () => {
        const passengers = [...this.state.passengers];
        this.addLog(`${passengerName} did't get in to the lift`, 'red');
        if (passengers.length > 0) {
          // if there are someone else waiting for the lift move on
          const to = !passengers[0].travelTo
            ? passengers[0].summonFrom
            : passengers[0].travelTo;

          this.moveTheLift(to);
        }
      }
    );
  };
  //The passenger get in the lift so it position needs to be changed
  // and buttons need to be showed for WAITING_TIME
  getInTheLift = (passengerName, direction) => {
    const passengers = [...this.state.passengers].map(passenger => {
      if (passenger.passengerName === passengerName) {
        passenger.position = IN_THE_LIFT;
      }

      return passenger;
    });

    const lift = { ...this.state.lift };
    lift.direction = direction;

    this.setState(
      prevState => {
        return {
          ...prevState,
          lift,
          passengers,
          passengerName,
          showButtons: true
        };
      },
      () => {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          // wait for WAITING_TIME
          // check if buttons are clicked
          // if not remove the passenger
          if (this.state.showButtons) {
            this.buttonDidNotClick(passengerName);
          }
        }, WAITING_TIME);
      }
    );
  };

  //update the lift floor and move it again
  updateLiftFloor = (value, to) => {
    const lift = { ...this.state.lift };
    lift.at = lift.at + value;

    this.setState(
      prevState => {
        return {
          ...prevState,
          lift
        };
      },
      () => {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          // move the lift to the new floor after waiting the travel time
          this.moveTheLift(to);
        }, TRAVEL_TIME);
      }
    );
  };

  //if there is any passengers, move the lift
  moveTheLift = (to, passengerName) => {
    const passengers = [...this.state.passengers];
    const { at, direction } = this.state.lift;

    const lifton = at === 0 ? 'Ground floor' : 'level ' + at;
    const toFloor = to === 0 ? 'Ground floor' : 'level ' + to;
    if (!passengerName) {
      this.addLog(`The lift on the ${lifton}.`, 'black');
    } else {
      this.addLog(`The ${passengerName} chooses to go to ${toFloor}.`, 'navy');
    }

    if (passengers) {
      // Check any passenger at this floor summons the same way
      // or any passenger will be got on this floor
      let passengerSummon = passengers.find(
        passenger =>
          (passenger.position === IN_THE_LIFT && passenger.travelTo === at) ||
          (passenger.position === ON_THE_FLOOR &&
            passenger.direction === direction &&
            passenger.summonFrom === at)
      );

      if (!passengerSummon && passengers.length > 0) {
        if (
          passengers[0].position === ON_THE_FLOOR &&
          passengers[0].summonFrom === at
        ) {
          passengerSummon = passengers[0];
        }
      }
      if (passengerSummon) {
        // If passenger in the lift, this means the passenger will get off the lift
        // so we need to remove it from the array
        if (passengerSummon.position === IN_THE_LIFT) {
          this.addLog(
            `${passengerSummon.passengerName} has gotten of the lift  on the ${lifton}.`,
            'green'
          );
          this.deletePassenger(passengerSummon.passengerName);
          return;
        }

        // If passenger on the flor, this means the passenger summons the lift
        // so we need to change the status as IN_THE_LIFT
        if (passengerSummon.position === ON_THE_FLOOR) {
          this.addLog(
            `The lift has opened its doors on the  ${lifton} and will be waited for the passenger for ${
              WAITING_TIME / 1000
            } seconds.`,
            'green'
          );
          this.getInTheLift(
            passengerSummon.passengerName,
            passengerSummon.direction
          );
          return;
        }
      }
    }
    let value;
    if (at !== to) {
      value = at < to ? 1 : -1;
      this.updateLiftFloor(value, to);
    }
  };

  //Add passenger into the passengers array state
  addPassenger = (direction, summonFrom) => {
    const passengerCount = this.state.passengerCount + 1;
    const passengerName = `Passenger - ${passengerCount}`;
    const passenger = new PassengerModel(
      summonFrom,
      null,
      ON_THE_FLOOR,
      passengerName,
      direction
    );

    const liftFloor = this.state.lift.at;

    let liftDirection = '';

    if (liftFloor < summonFrom) {
      liftDirection = UP;
    } else if (liftFloor > summonFrom) {
      liftDirection = DOWN;
    } else {
      //do nothing
    }

    this.setState(
      prevState => ({
        ...prevState,
        passengerCount,
        passengers: [...prevState.passengers, passenger],
        lift: {
          ...prevState.lift,
          travelTo: summonFrom,
          direction: liftDirection
        }
      }),
      () => {
        const from = summonFrom === 0 ? 'Ground floor' : 'level ' + summonFrom;
        this.addLog(`${passengerName} summons lift on the ${from}.`, 'red');

        //Call the movethelift if no one else call it
        if (this.state.passengers.length === 1) {
          this.moveTheLift(summonFrom);
        }
      }
    );
  };

  setNewTravelDestination = (to, passengerName) => {
    const lift = { ...this.state.lift };
    lift.travelTo = to;
    if (to > lift.at) {
      lift.direction = UP;
    }
    if (to < lift.at) {
      lift.direction = DOWN;
    }

    const passengers = [...this.state.passengers].map(passenger => {
      if (passenger.passengerName === passengerName) {
        passenger.travelTo = to;
      }

      return passenger;
    });

    this.setState(
      prevState => ({
        ...prevState,
        lift,
        showButtons: false,
        passengers
      }),
      () => {
        // move the lift
        this.moveTheLift(to, passengerName);
      }
    );
  };
  //When call button clicked on a floor this function is being triggered
  onArrowClickHandler = (direction, floor) => {
    this.addPassenger(direction, floor);
  };

  //When any lift button clicks in the lift this function is being triggered
  onButtonClickHandler = (index, passengerName) => {
    this.setNewTravelDestination(index, passengerName);
  };

  renderFloors = () => {
    const arr = [];
    for (let i = 0; i <= 10; i++) {
      arr.push(
        <Floors
          key={i}
          passengerName={this.state.passengerName}
          elevatorAt={this.state.lift.at}
          elevatorDirection={this.state.lift.direction}
          showButtons={this.state.lift.at === i && this.state.showButtons}
          floor={i}
          onArrowClickHandler={this.onArrowClickHandler}
          onButtonClickHandler={this.onButtonClickHandler}
        />
      );
    }
    return arr;
  };
  renderLogs = () => {
    const arr = [];
    this.state.logs.forEach((log, index) => {
      arr.push(
        <div key={index}>
          <span className={classes[log.style]}>{log.log}</span>
        </div>
      );
    });

    return arr;
  };
  render() {
    return (
      <div className={classes.mainDiv}>
        <div className={classes.elevatorDiv}>{this.renderFloors()}</div>
        <div className={classes.logDiv}>{this.renderLogs()}</div>
      </div>
    );
  }
}

export default Lift;
