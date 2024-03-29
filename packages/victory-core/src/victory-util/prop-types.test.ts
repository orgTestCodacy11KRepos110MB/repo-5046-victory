/* global console */
/* eslint no-unused-expressions: 0 */
import React from "react";
import PropTypes from "prop-types";
import { PropTypes as CustomPropTypes } from "victory-core";

describe("victory-util/prop-types", () => {
  const rest = ["location", "propFullName"] as const;

  describe("should be type-safe", () => {
    const TestComp: React.FC<{
      number: number;
      string: string;
      optional?: string;
    }> = () => null;

    it("check regular PropTypes", () => {
      // Correct usage:
      TestComp.propTypes = { number: PropTypes.number.isRequired };
      // @ts-expect-error Incorrect usage:
      TestComp.propTypes = { number: PropTypes.number };

      // Correct usage:
      TestComp.propTypes = { string: PropTypes.string.isRequired };
      // @ts-expect-error Incorrect usage:
      TestComp.propTypes = { string: PropTypes.number };
      // @ts-expect-error Incorrect usage:
      TestComp.propTypes = { string: PropTypes.number.isRequired };

      // Correct usage:
      TestComp.propTypes = { optional: PropTypes.string };
      // @ts-expect-error Incorrect usage:
      TestComp.propTypes = { optional: PropTypes.number };
    });

    it("CustomPropTypes.integer", () => {
      // Correct usage:
      TestComp.propTypes = { number: CustomPropTypes.integer.isRequired };
      // @ts-expect-error Incorrect usage:
      TestComp.propTypes = { number: CustomPropTypes.integer };
      // @ts-expect-error Incorrect usage:
      TestComp.propTypes = { string: CustomPropTypes.integer.isRequired };
      // @ts-expect-error Incorrect usage:
      TestComp.propTypes = { string: CustomPropTypes.integer };
    });
    it("CustomPropTypes.greaterThanZero", () => {
      // Correct usage:
      TestComp.propTypes = {
        number: CustomPropTypes.greaterThanZero.isRequired,
      };
      // @ts-expect-error Incorrect usage:
      TestComp.propTypes = { number: CustomPropTypes.greaterThanZero };
      TestComp.propTypes = {
        // @ts-expect-error Incorrect usage:
        string: CustomPropTypes.greaterThanZero.isRequired,
      };
      // @ts-expect-error Incorrect usage:
      TestComp.propTypes = { string: CustomPropTypes.greaterThanZero };
    });
    it("CustomPropTypes.nonNegative", () => {
      // Correct usage:
      TestComp.propTypes = { number: CustomPropTypes.nonNegative.isRequired };
      // @ts-expect-error Incorrect usage:
      TestComp.propTypes = { number: CustomPropTypes.nonNegative };
      // @ts-expect-error Incorrect usage:
      TestComp.propTypes = { string: CustomPropTypes.nonNegative.isRequired };
      // @ts-expect-error Incorrect usage:
      TestComp.propTypes = { string: CustomPropTypes.nonNegative };
    });
  });

  /* eslint-disable no-console */
  describe("deprecated", () => {
    const shouldWarn = (message) => {
      expect(console.warn).toBeCalledTimes(1);
      expect(console.warn).toBeCalledWith(message);
    };

    const shouldError = (message) => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error).toBeCalledWith(message);
    };

    const shouldNotError = () => {
      expect(console.error).not.toHaveBeenCalled();
    };

    const validate = (prop) => {
      return CustomPropTypes.deprecated(PropTypes.string, "Read more at link")(
        {
          pName: prop,
        },
        "pName",
        "ComponentName",
        ...rest,
      )!;
    };

    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => null);
      jest.spyOn(console, "error").mockImplementation(() => null);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("Should warn about deprecation and validate OK", () => {
      validate("value");
      shouldWarn(
        '"pName" property of "ComponentName" has been deprecated Read more at link',
      );
      shouldNotError();
    });

    it(`Should warn about deprecation and throw validation error when property
       value is not OK`, () => {
      validate({});
      shouldWarn(
        '"pName" property of "ComponentName" has been deprecated Read more at link',
      );
      shouldError(
        "Warning: Failed pName type: Invalid pName `pName` of type `object` supplied to " +
          "`ComponentName`, expected `string`.",
      );
    });
  });
  /* eslint-enable no-console */

  describe("allOfType", () => {
    const validate = function (prop) {
      const validator = CustomPropTypes.allOfType([
        CustomPropTypes.nonNegative,
        CustomPropTypes.integer,
      ]);
      return validator(
        { testProp: prop },
        "testProp",
        "TestComponent",
        ...rest,
      )!;
    };

    it("returns an error if the first validator is false", () => {
      const result = validate(-1);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be a non-negative number.",
      );
    });

    it("returns an error if the second validator is false", () => {
      const result = validate(1.3);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be an integer.",
      );
    });

    it("does not return an error if both validators are true", () => {
      const result = validate(3);
      expect(result).not.toBeInstanceOf(Error);
    });
  });

  describe("nonNegative", () => {
    const validate = function (prop) {
      return CustomPropTypes.nonNegative(
        { testProp: prop },
        "testProp",
        "TestComponent",
        ...rest,
      )!;
    };

    it("returns an error for non numeric values", () => {
      const result = validate("a");
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be a non-negative number.",
      );
    });

    it("returns an error for negative numeric values", () => {
      const result = validate(-1);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be a non-negative number.",
      );
    });

    it("does not return an error for positive numeric values", () => {
      const result = validate(1);
      expect(result).not.toBeInstanceOf(Error);
    });

    it("does not return an error for zero", () => {
      const result = validate(0);
      expect(result).not.toBeInstanceOf(Error);
    });
  });

  describe("integer", () => {
    const validate = function (prop) {
      return CustomPropTypes.integer(
        { testProp: prop },
        "testProp",
        "TestComponent",
        ...rest,
      )!;
    };

    it("returns an error for non numeric values", () => {
      const result = validate("a");
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be an integer.",
      );
    });

    it("returns an error for non-integer numeric values", () => {
      const result = validate(2.4);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be an integer.",
      );
    });

    it("does not return an error for integers", () => {
      let result = validate(3);
      expect(result).not.toBeInstanceOf(Error);
      result = validate(-3);
      expect(result).not.toBeInstanceOf(Error);
      result = validate(0);
      expect(result).not.toBeInstanceOf(Error);
    });
  });

  describe("greaterThanZero", () => {
    const validate = function (prop) {
      return CustomPropTypes.greaterThanZero(
        { testProp: prop },
        "testProp",
        "TestComponent",
        ...rest,
      )!;
    };

    it("returns an error for non numeric values", () => {
      const result = validate("a");
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be a number greater than zero.",
      );
    });

    it("returns an error for zero", () => {
      const result = validate(0);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be a number greater than zero.",
      );
    });

    it("returns an error for negative numbers", () => {
      const result = validate(-3);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be a number greater than zero.",
      );
    });

    it("does not return an error for numbers greater than zero", () => {
      let result = validate(0.1);
      expect(result).not.toBeInstanceOf(Error);
      result = validate(5);
      expect(result).not.toBeInstanceOf(Error);
      result = validate(1);
      expect(result).not.toBeInstanceOf(Error);
    });
  });

  describe("domain", () => {
    const validate = function (prop) {
      return CustomPropTypes.domain(
        { testProp: prop },
        "testProp",
        "TestComponent",
        ...rest,
      )!;
    };

    it("returns an error for non array values", () => {
      const result = validate("a");
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be an array of two unique numeric values.",
      );
    });

    it("returns an error when the length of the array is not two", () => {
      const result = validate([1]);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be an array of two unique numeric values.",
      );
    });

    it("returns an error when the values of the array are equal", () => {
      const result = validate([1, 1]);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be an array of two unique numeric values.",
      );
    });

    it("does not return an error for two element ascending arrays", () => {
      const result = validate([0, 1]);
      expect(result).not.toBeInstanceOf(Error);
    });

    it("does not return an error for two element descending arrays", () => {
      const result = validate([1, 0]);
      expect(result).not.toBeInstanceOf(Error);
    });

    it("does not return an error arrays of dates", () => {
      const result = validate([new Date(1980, 1, 1), new Date(1990, 1, 1)]);
      expect(result).not.toBeInstanceOf(Error);
    });
  });

  describe("scale", () => {
    const validate = function (prop) {
      return CustomPropTypes.scale(
        { testProp: prop },
        "testProp",
        "TestComponent",
        ...rest,
      )!;
    };

    it("returns an error for non function values", () => {
      const result = validate("a");
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be a d3 scale.",
      );
    });

    it("returns an error when the function does not have a domain, range, and copy methods", () => {
      const testFunc = () => "oops";

      const result = validate(testFunc);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be a d3 scale.",
      );
    });

    it.skip("does not return an error when the function is a d3 scale", () => {
      // const testFunc = d3.scale.linear; TODO: Mock this rather than depending on d3
      // const result = validate(testFunc);
      // expect(result).not.to.be.an.instanceOf(Error);
    });
  });

  describe("homogeneousArray", () => {
    const validate = function (prop) {
      return CustomPropTypes.homogeneousArray(
        { testProp: prop },
        "testProp",
        "TestComponent",
        ...rest,
      )!;
    };

    it("returns an error for non array values", () => {
      const result = validate("a");
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain(
        "`testProp` in `TestComponent` must be an array.",
      );
    });

    it("returns an error when the array has elements of different types", () => {
      const result = validate([1, "a"]);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toEqual(
        "Expected `testProp` in `TestComponent` to be a homogeneous array, but found " +
          "types `Number` and `String`.",
      );
    });

    it("does not return an error for empty arrays", () => {
      const result = validate([]);
      expect(result).not.toBeInstanceOf(Error);
    });

    it("does not return an error for arrays with one item", () => {
      const result = validate(["a"]);
      expect(result).not.toBeInstanceOf(Error);
    });

    it("does not return an error for arrays where all elements are the same type", () => {
      const result = validate([1, 0]);
      expect(result).not.toBeInstanceOf(Error);
    });
  });

  describe("matchDataLength", () => {
    const validate = function (prop?, dataProp?) {
      const props = { testProp: prop, data: dataProp };
      return CustomPropTypes.matchDataLength(
        props,
        "testProp",
        "TestComponent",
        ...rest,
      )!;
    };

    it("does not return an error when prop is undefined", () => {
      expect(validate()).not.toBeInstanceOf(Error);
    });

    it("does not return an error when prop has same length as data", () => {
      expect(validate([{}, {}], [1, 2])).not.toBeInstanceOf(Error);
    });

    it("returns an error when prop doesn't have same length as data", () => {
      const result = validate([{}], [1, 2]);
      expect(result).toBeInstanceOf(Error);
      expect(result).toHaveProperty(
        "message",
        "Length of data and testProp arrays must match.",
      );
    });
  });
});
