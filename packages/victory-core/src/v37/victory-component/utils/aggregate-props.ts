import { getData } from "../../victory-state/helpers/get-data";
import { getDomain } from "../../victory-state/helpers/get-domain";
import { getRange } from "../../victory-state/helpers/get-range";
import { getScale } from "../../victory-state/helpers/get-scale";
import { VictoryDatableProps } from "../../../victory-util";
import {
  AggregatePropsConfig,
  NormalizePropsConfig,
} from "../core/nestable-component";
import { satisfies } from "./satisfies";

/**
 * Returns the domain of all data sets
 */
const getAggregateDomain = (allProps: VictoryNormalizedDataProps[]) => {
  const domains = allProps.map((props) => ({
    x: getDomain(props, "x"),
    y: getDomain(props, "y"),
  }));

  return {
    x: [
      Math.min(...domains.map((d) => d.x[0] as number)),
      Math.max(...domains.map((d) => d.x[1] as number)),
    ],
    y: [
      Math.min(...domains.map((d) => d.y[0] as number)),
      Math.max(...domains.map((d) => d.y[1] as number)),
    ],
  };
};

function getAggregateRange(allProps: VictoryNormalizedDataProps[]) {
  const allRanges = allProps.map((props) => ({
    x: getRange(props, "x"),
    y: getRange(props, "y"),
  }));

  return {
    x: [
      Math.min(...allRanges.map((r) => r.x[0])),
      Math.max(...allRanges.map((r) => r.x[1])),
    ],
    y: [
      Math.min(...allRanges.map((r) => r.y[0])),
      Math.max(...allRanges.map((r) => r.y[1])),
    ],
  };
}

type VictoryNormalizedDataProps = VictoryDatableProps;

export const AggregateProps = satisfies<AggregatePropsConfig<any, any>>()({
  domain: (myProps, allProps, memo) => {
    return memo(getAggregateDomain)(allProps as VictoryNormalizedDataProps[]);
  },
  range: (myProps, allProps, memo) => {
    return memo(getAggregateRange)(allProps as VictoryNormalizedDataProps[]);
  },
  scale: (props, allProps, memo) => {
    const domain = AggregateProps.domain(props, allProps, memo);
    const range = AggregateProps.range(props, allProps, memo);
    return {
      // @ts-expect-error ---
      x: getScale(props, "x")().domain(domain.x).range(range.x),
      // @ts-expect-error ---
      y: getScale(props, "y")().domain(domain.y).range(range.y),
    };
  },
});

export const NormalizeProps = satisfies<NormalizePropsConfig<any, any>>()({
  /**
   * Normalizes the `data` property, evaluating using other props like x, y, and sortKey.
   */
  data: (props: VictoryDatableProps) => {
    return getData(props);
  },
});
