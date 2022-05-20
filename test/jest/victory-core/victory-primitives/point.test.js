import { assign } from "lodash";
import React from "react";
import { Point, PointPathHelpers as pathHelpers } from "victory-core";
import { renderInSvg } from "../../rendering-utils";

describe("victory-primitives/point", () => {
  const baseProps = {
    x: 5,
    y: 10,
    size: 1
  };

  it("should render the appropriate symbol", () => {
    [
      "circle",
      "square",
      "diamond",
      "triangleDown",
      "triangleUp",
      "plus",
      "minus",
      "star",
      "cross"
    ].forEach((symbol) => {
      const stub = jest
        .spyOn(pathHelpers, symbol)
        // eslint-disable-next-line max-nested-callbacks
        .mockImplementation(() => `${symbol} symbol`);
      const props = assign({}, baseProps, { symbol });
      const { container } = renderInSvg(<Point {...props} />);
      const directions = container.querySelector("path").getAttribute("d");

      expect(stub).toHaveBeenCalledTimes(1);
      expect(stub).toHaveBeenCalledWith(5, 10, 1);
      expect(directions).toEqual(`${symbol} symbol`);
    });
  });
});
