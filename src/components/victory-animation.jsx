import React from "react";
import d3Ease from "d3-ease";
import d3Interpolate from "d3-interpolate";
import { timer } from "d3-timer";
import { addVictoryInterpolator } from "../util";

// Nearly all animation libraries are duration-based, not velocity-based.
// In other words, you say "I want the animation to take this long", not
// "I want things to move this fast". Using velocity will make the animation
// take different amounts of time on computers of different speed, since
// they'll have a different framerate but still adjust values by the same
// velocity each frame. But for now we still support velocity as we have code
// using it. Since we use `d3-timer` now and it's duration-based, choose a
// velocity multiplier here that just happens to result in animations going
// approximately the same speed on systems getting around 60 fps.
const VELOCITY_MULTIPLIER = 16.5; // ~ 1 / 60

addVictoryInterpolator();

export default class VictoryAnimation extends React.Component {
  static propTypes = {
    children: React.PropTypes.func,
    velocity: React.PropTypes.number,
    easing: React.PropTypes.oneOf([
      "back", "backIn", "backOut", "backInOut",
      "bounce", "bounceIn", "bounceOut", "bounceInOut",
      "circle", "circleIn", "circleOut", "circleInOut",
      "linear", "linearIn", "linearOut", "linearInOut",
      "cubic", "cubicIn", "cubicOut", "cubicInOut",
      "elastic", "elasticIn", "elasticOut", "elasticInOut",
      "exp", "expIn", "expOut", "expInOut",
      "poly", "polyIn", "polyOut", "polyInOut",
      "quad", "quadIn", "quadOut", "quadInOut",
      "sin", "sinIn", "sinOut", "sinInOut"
    ]),
    delay: React.PropTypes.number,
    onEnd: React.PropTypes.func,
    data: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.array
    ])
  };

  static defaultProps = {
    /* velocity modifies step each frame */
    velocity: 0.02,
    /* easing modifies step each frame */
    easing: "quadInOut",
    /* delay between transitions */
    delay: 0,
    /* we got nothin' */
    data: {}
  };

  constructor(props) {
    super(props);
    /* defaults */
    this.state = Array.isArray(this.props.data) ?
      this.props.data[0] : this.props.data;
    this.interpolator = null;
    this.queue = Array.isArray(this.props.data) ?
      this.props.data.slice(1) : [];
    /* build easing function */
    this.ease = d3Ease[this.props.easing];
    /*
      unlike React.createClass({}), there is no autobinding of this in ES6 classes
      so we bind functionToBeRunEachFrame to current instance of victory animation class
    */
    this.functionToBeRunEachFrame = this.functionToBeRunEachFrame.bind(this);
  }
  componentDidMount() {
    // Length check prevents us from triggering `onEnd` in `traverseQueue`.
    if (this.queue.length) {
      this.traverseQueue();
    }
  }
  /* lifecycle */
  componentWillReceiveProps(nextProps) {
    /* cancel existing loop if it exists */
    if (this.timer) {
      this.timer.stop();
    }
    /* If an object was supplied */
    if (!Array.isArray(nextProps.data)) {
      // Replace the tween queue. Could set `this.queue = [nextProps.data]`,
      // but let's reuse the same array.
      this.queue.length = 0;
      this.queue.push(nextProps.data);
    /* If an array was supplied */
    } else {
      /* Extend the tween queue */
      this.queue.push(...nextProps.data);
    }
    /* Start traversing the tween queue */
    this.traverseQueue();
  }
  componentWillUnmount() {
    if (this.timer) {
      this.timer.stop();
    }
  }
  /* Traverse the tween queue */
  traverseQueue() {
    if (this.queue.length) {
      /* Get the next index */
      const data = this.queue[0];
      /* compare cached version to next props */
      this.interpolator = d3Interpolate.value(this.state, data);
      /* reset step to zero */
      this.timer = timer(this.functionToBeRunEachFrame, this.props.delay);
    } else if (this.props.onEnd) {
      this.props.onEnd();
    }
  }
  /* every frame we... */
  functionToBeRunEachFrame(elapsed) {
    /*
      step can generate imprecise values, sometimes greater than 1
      if this happens set the state to 1 and return, cancelling the timer
    */
    const step = elapsed / (VELOCITY_MULTIPLIER / this.props.velocity);

    if (step >= 1) {
      this.setState(this.interpolator(1));
      this.timer.stop();
      this.queue.shift();
      this.traverseQueue(); // Will take care of calling `onEnd`.
      return;
    }
    /*
      if we're not at the end of the timer, set the state by passing
      current step value that's transformed by the ease function to the
      interpolator, which is cached for performance whenever props are received
    */
    this.setState(this.interpolator(this.ease(step)));
  }
  render() {
    return this.props.children(this.state);
  }
}
