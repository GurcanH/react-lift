import React, { Component } from 'react';
import { ArrowUpward, ArrowDownward } from '@material-ui/icons';
import classes from './Floors.module.css';
import elevatorIcon from '../../assets/elevator-24px.svg';
import { UP, DOWN } from '../../config/constants';

const INITIAL_STATE = {
  upClicked: false,
  downClicked: false,
  floor: -1
};
class Floors extends Component {
  floorText = this.props.floor === 0 ? 'G' : `L-${this.props.floor}`;
  state = INITIAL_STATE;

  onArrowClickHandler = (upDown, floor) => {
    if (upDown === UP) {
      this.setState({ upClicked: true, floor: floor });
    } else if (upDown === DOWN) {
      this.setState({ downClicked: true, floor: floor });
    }

    this.props.onArrowClickHandler(upDown, floor);
  };

  onButtonClickHandler = index => {
    this.setState({ upClicked: false, downClicked: false }, () => {
      this.props.onButtonClickHandler(index, this.props.passengerName);
    });
  };

  render() {
    let { upClicked, downClicked } = this.state;

    const imageclassUp = [classes.arrowImg];
    const imageclassDown = [classes.arrowImg];

    if (upClicked) {
      imageclassUp.push(classes.green);
    }
    if (downClicked) {
      imageclassDown.push(classes.green);
    }

    const renderButtons = () => {
      const arr = [];
      for (let i = 0; i <= 10; i++) {
        arr.push(
          <button
            disabled={
              (this.props.elevatorAt <= i &&
                this.props.elevatorDirection === DOWN) ||
              (this.props.elevatorAt >= i &&
                this.props.elevatorDirection === UP)
            }
            key={i}
            onClick={() => {
              this.onButtonClickHandler(i);
            }}
          >
            {i}
          </button>
        );
      }
      return arr;
    };

    return (
      <div className={classes.innerDiv}>
        <div className={classes.floorText}>{this.floorText}</div>

        <ArrowUpward
          style={
            this.props.floor === 10
              ? { visibility: 'hidden' }
              : { visibility: 'visible' }
          }
          floor={this.props.floor}
          className={imageclassUp.join(' ')}
          alt='Up'
          onClick={() => {
            this.onArrowClickHandler(UP, this.props.floor);
          }}
        />

        <img
          className={classes.elevatorImg}
          src={elevatorIcon}
          alt='Elevator'
        />

        <ArrowDownward
          style={
            this.props.floor === 0
              ? { visibility: 'hidden' }
              : { visibility: 'visible' }
          }
          floor={this.props.floor}
          className={imageclassDown.join(' ')}
          onClick={() => {
            this.onArrowClickHandler(DOWN, this.props.floor);
          }}
          alt='Down'
        />
        <div className={classes.buttondiv}>
          {this.props.showButtons ? renderButtons() : null}
        </div>
      </div>
    );
  }
}

export default Floors;
