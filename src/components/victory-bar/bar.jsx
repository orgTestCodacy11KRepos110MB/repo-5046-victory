import React, { PropTypes } from "react";
import { Helpers } from "victory-core";

export default class Bar extends React.Component {

  static propTypes = {
    index: PropTypes.number,
    events: PropTypes.object,
    horizontal: PropTypes.bool,
    style: PropTypes.object,
    datum: PropTypes.object,
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    y0: React.PropTypes.number
  };

  getVerticalBarPath(props, width) {
    const {x, y0, y} = props;
    const size = width / 2;
    return `M ${x - size}, ${y0}
      L ${x - size}, ${y}
      L ${x + size}, ${y}
      L ${x + size}, ${y0}
      L ${x - size}, ${y0}`;
  }

  getHorizontalBarPath(props, width) {
    const {x, y0, y} = props;
    const size = width / 2;
    return `M ${y0}, ${x - size}
      L ${y0}, ${x + size}
      L ${y}, ${x + size}
      L ${y}, ${x - size}
      L ${y0}, ${x - size}`;
  }

  getBarPath(props, width) {
    return this.props.horizontal ?
      this.getHorizontalBarPath(props, width) : this.getVerticalBarPath(props, width);
  }

  render() {
    const style = Helpers.evaluateStyle(this.props.style, this.props.datum);
    // TODO better bar width calculation
    const barWidth = style.width || 8;
    const path = typeof this.props.x === "number" ?
      this.getBarPath(this.props, barWidth) : undefined;
    return (
      <path
        {...this.props.events}
        d={path}
        style={style}
        shapeRendering="optimizeSpeed"
      />
    );
  }
}
