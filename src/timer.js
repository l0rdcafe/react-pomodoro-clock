import React from "react";
import TimerLengthControl from "./timer-length-control";

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      brkLength: 5,
      seshLength: 25,
      timerState: "stopped",
      timerType: "Session",
      timer: 1500,
      intervalID: "",
      alarmColor: { color: "white" }
    };
  }
  setBrkLength = e => {
    this.lengthControl("brkLength", e.currentTarget.value, this.state.brkLength, "Session");
  };
  setSeshLength = e => {
    this.lengthControl("seshLength", e.currentTarget.value, this.state.seshLength, "Break");
  };
  lengthControl = (stateToChange, sign, currLen, timerType) => {
    if (this.state.timerState === "running") {
      return null;
    }

    if (this.state.timerType === timerType) {
      if (sign === "-" && currLen !== 1) {
        this.setState({ [stateToChange]: currLen - 1 });
      } else if (sign === "+" && currLen !== 60) {
        this.setState({ [stateToChange]: currLen + 1 });
      }
    } else if (sign === "-" && currLen !== 1) {
      this.setState({ [stateToChange]: currLen - 1, timer: currLen * 60 - 60 });
    } else if (sign === "+" && currLen !== 60) {
      this.setState({ [stateToChange]: currLen + 1, timer: currLen * 60 + 60 });
    }
  };
  decrementTimer = () => {
    this.setState({ timer: this.state.timer - 1 });
  };
  warning = timer => {
    if (timer < 61) {
      this.setState({ alarmColor: { color: "#a50d0d" } });
    } else {
      this.setState({ alarmColor: { color: "white" } });
    }
  };
  buzzer = timer => {
    if (timer === 0) {
      this.audioBeep.play();
    }
  };
  switchTimer = (num, str) => {
    this.setState({
      timer: num,
      timerType: str,
      alarmColor: { color: "white" }
    });
  };
  phaseControl = () => {
    const { timer } = this.state;
    this.warning(timer);
    this.buzzer(timer);

    if (timer < 0) {
      if (this.state.timerType === "Session") {
        if (this.state.intervalID) {
          clearInterval(this.state.intervalID);
        }
        this.beginCountdown();
        this.switchTimer(this.state.brkLength * 60, "Break");
      } else if (this.state.intervalID) {
        clearInterval(this.state.intervalID);
      }
      this.beginCountdown();
      this.switchTimer(this.state.seshLength * 60, "Session");
    }
  };
  beginCountdown = () => {
    this.setState({
      intervalID: setInterval(() => {
        this.decrementTimer();
        this.phaseControl();
      }, 1000)
    });
  };
  timerControl = () => {
    if (this.state.timerState === "stopped") {
      this.beginCountdown();
      this.setState({ timerState: "running" });
    } else {
      this.setState({ timerState: "stopped" });

      if (this.state.intervalID) {
        clearInterval(this.state.intervalID);
      }
    }
  };
  clockify = () => {
    let mins = Math.floor(this.state.timer / 60);
    let secs = this.state.timer - mins * 60;
    secs = secs < 10 ? `0${secs}` : secs;
    mins = mins < 10 ? `0${mins}` : mins;
    return `${mins}:${secs}`;
  };
  reset = () => {
    this.setState({
      brkLength: 5,
      seshLength: 25,
      timerState: "stopped",
      timerType: "Session",
      timer: 1500,
      intervalID: "",
      alarmColor: { color: "white" }
    });

    if (this.state.intervalID) {
      clearInterval(this.state.intervalID);
    }
    this.audioBeep.pause();
    this.audioBeep.currentTime = 0;
  };
  render() {
    return (
      <div>
        <div className="main-title">Pomodoro Clock</div>
        <TimerLengthControl
          titleID="break-label"
          minID="break-decrement"
          lengthID="break-length"
          title="Break Length"
          addID="break-increment"
          onClick={this.setBrkLength}
          length={this.state.brkLength}
        />
        <TimerLengthControl
          titleID="session-label"
          minID="session-decrement"
          addID="session-increment"
          lengthID="session-length"
          title="Session Length"
          onClick={this.setSeshLength}
          length={this.state.seshLength}
        />
        <div className="timer" style={this.state.alarmColor}>
          <div className="timer-wrapper">
            <div id="timer-label">{this.state.timerType}</div>
            <div id="time-left">{this.clockify()}</div>
          </div>
        </div>
        <div className="timer-control">
          <button id="start_stop" onClick={this.timerControl}>
            <i className="fa fa-play fa-2x" />
            <i className="fa fa-pause fa-2x" />
          </button>
          <button id="reset" onClick={this.reset}>
            <i className="fas fa-sync-alt fa-2x" />
          </button>
        </div>
        <audio
          id="beep"
          preload="auto"
          src="https://goo.gl/65cB11"
          ref={audio => {
            this.audioBeep = audio;
          }}
        />
      </div>
    );
  }
}

export default Timer;
