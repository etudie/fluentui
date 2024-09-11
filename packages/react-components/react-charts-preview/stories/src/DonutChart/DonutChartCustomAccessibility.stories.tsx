import * as React from 'react';
import {
  DonutChart,
  IChartProps,
  IChartDataPoint,
  DataVizPalette,
  getColorFromToken,
} from '@fluentui/react-charts-preview';

export const DonutCustomAccess = () => {
  const points: IChartDataPoint[] = [
    {
      legend: 'first',
      data: 20000,
      color: getColorFromToken(DataVizPalette.color16),
      xAxisCalloutData: '2020/04/30',
      callOutAccessibilityData: { ariaLabel: 'Pia chart 1 of 2 2020/04/30' },
    },
    {
      legend: 'second',
      data: 39000,
      color: getColorFromToken(DataVizPalette.color3),
      xAxisCalloutData: '2020/04/20',
      callOutAccessibilityData: { ariaLabel: 'Pia chart 2 of 2 2020/04/20' },
    },
  ];
  const data: IChartProps = {
    chartTitle: 'Donut chart custom accessibility example',
    chartData: points,
    chartTitleAccessibilityData: { ariaLabel: 'Bar chart depicting about Donut chart' },
  };
  return (
    <DonutChart
      data={data}
      innerRadius={55}
      href={'https://developer.microsoft.com/en-us/'}
      legendsOverflowText={'overflow Items'}
      hideLegend={false}
      height={220}
      width={176}
      valueInsideDonut={39000}
    />
  );
};
DonutCustomAccess.parameters = {
  docs: {
    description: {
      story: 'Donut Chart Story.',
    },
  },
};
