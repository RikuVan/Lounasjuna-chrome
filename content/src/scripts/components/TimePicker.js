import React, {Component} from 'react';
import PropTypes from 'prop-types';
import NumberPicker from './NumberPicker';
import {compose, split, prop, head, tail} from 'Ramda';
import setClass from 'classnames';

const splitAtColon = key => compose(split(':'), prop(key));
const getHour = key => compose(Number, head, splitAtColon(key));
const getMinutes = key => compose(Number, tail, splitAtColon(key));

const Space = () => <div style={{width: '3px', display: 'flex'}}></div>;

class TimePicker extends Component {
  state = {
    hour: getHour('start')(this.props.hours),
    minutes: getMinutes('start')(this.props.hours),
    time: this.props.hours.start,
  };

  componentDidMount() {
    this.props.onChange(this.props.id, this.state.time)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.time !== this.state.time) {
      this.props.onChange(this.props.id, this.state.time)
    }
  }

  setTime = () => {
    this.setState(
      state => {
        const minutes = state.minutes.toString().length === 2
          ? state.minutes
          : `0${state.minutes}`;
        return `${state.hour}:${minutes}`
      },
      () => this.props.onChange(this.props.id, this.state.time)
    )
  }

  handleChange = type =>
    number => this.setState(state => ({[type]: number}), this.setTime)

  render() {
    const {disabled, selected} = this.props;

    //const options = generateOptions(hours)
    return (
      <div className="lj-timepicker">
        {selected
          ? <div className="lj-time-display">
              {this.state.time}
            </div>
          : <div className="lj-timeinputs">
              <NumberPicker
                type={'hour'}
                onChange={this.handleChange}
                value={this.state.hour}
                min={getHour('start')(this.props.hours)}
                max={getHour('end')(this.props.hours)}
                disabled={disabled}
              />
              <Space />
              <span className="hour-minute-separator">:</span>
              <Space />
              <NumberPicker
                type={'minutes'}
                onChange={this.handleChange}
                value={this.state.minutes}
                min={0}
                max={60}
                step={15}
                formatter={value =>
                  value && value.length === 1 ? `0${value}` : value}
                disabled={disabled}
              />
            </div>
          }
      </div>
    );
  }
}

TimePicker.propTypes = {
  hours: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default TimePicker
