/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import * as React from 'react';
import { classNamesFunction, getId } from '@fluentui/react/lib/Utilities';
import { ScaleOrdinal } from 'd3-scale';
import { IProcessedStyleSet } from '@fluentui/react/lib/Styling';
import { FocusZone, FocusZoneDirection, FocusZoneTabbableElements } from '@fluentui/react-focus';
import { IAccessibilityProps, ChartHoverCard, ILegend, Legends } from '../../index';
import { Pie } from './Pie/index';
import { IChartDataPoint, IDonutChartProps, IDonutChartStyleProps, IDonutChartStyles } from './index';
import { getColorFromToken, getNextColor } from '../../utilities/index';
import { convertToLocaleString } from '../../utilities/locale-util';
import { Popover, PopoverSurface } from '@fluentui/react-components';
const getClassNames = classNamesFunction<IDonutChartStyleProps, IDonutChartStyles>();
const LEGEND_CONTAINER_HEIGHT = 40;

export interface IDonutChartState {
  showHover?: boolean;
  value?: string | undefined;
  legend?: string | undefined;
  _width?: number | undefined;
  _height?: number | undefined;
  activeLegend?: string;
  color?: string | undefined;
  xCalloutValue?: string;
  yCalloutValue?: string;
  focusedArcId?: string;
  selectedLegend: string;
  dataPointCalloutProps?: IChartDataPoint;
  callOutAccessibilityData?: IAccessibilityProps;
  isPopoverOpen: boolean;
  clickPosition: { x: number; y: number };
  targetElement: any;
}
export class DonutChartV9Base extends React.Component<IDonutChartProps, IDonutChartState> {
  public static defaultProps: Partial<IDonutChartProps> = {
    innerRadius: 0,
    hideLabels: true,
  };
  public _colors: ScaleOrdinal<string, {}>;
  private _classNames: IProcessedStyleSet<IDonutChartStyles>;
  private _rootElem: HTMLElement | null;
  private _uniqText: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  private _calloutId: string;
  private _calloutAnchorPoint: IChartDataPoint | null;
  private _emptyChartId: string | null;
  private _popoverTarget: any;
  // private pieRef: any;

  public static getDerivedStateFromProps(
    nextProps: Readonly<IDonutChartProps>,
    prevState: Readonly<IDonutChartState>,
  ): Partial<IDonutChartState> | null {
    let widthState: { _width: number } | undefined;
    if (nextProps.width && nextProps.width !== prevState._width) {
      widthState = { _width: nextProps.width };
    }

    let heightState: { _height: number } | undefined;
    if (nextProps.height && nextProps.height !== prevState._height) {
      heightState = { _height: nextProps.height - LEGEND_CONTAINER_HEIGHT };
    }

    return { ...widthState, ...heightState };
  }

  constructor(props: IDonutChartProps) {
    super(props);
    this.state = {
      showHover: false,
      value: '',
      legend: '',
      _width: this.props.width || 200,
      _height: this.props.height || 200,
      activeLegend: '',
      color: '',
      xCalloutValue: '',
      yCalloutValue: '',
      selectedLegend: '',
      focusedArcId: '',
      isPopoverOpen: false,
      clickPosition: { x: 0, y: 0 },
      targetElement: null,
    };
    this._hoverCallback = this._hoverCallback.bind(this);
    this._focusCallback = this._focusCallback.bind(this);
    this._hoverLeave = this._hoverLeave.bind(this);
    this._calloutId = getId('callout');
    this._uniqText = getId('_Pie_');
    this._emptyChartId = getId('_DonutChart_empty');
    this._popoverTarget = null;
    // this.pieRef = React.createRef(); // Creating a ref for the Pie component
  }
  public componentDidMount(): void {
    if (this._rootElem) {
      this.setState({
        _width: this._rootElem.offsetWidth,
        _height: this._rootElem.offsetHeight - LEGEND_CONTAINER_HEIGHT,
      });
    }
  }

  public render(): JSX.Element {
    const { data, hideLegend = false } = this.props;
    const points = this._addDefaultColors(data?.chartData);

    this._classNames = getClassNames(this.props.styles!, {
      theme: this.props.theme!,
      width: this.state._width!,
      height: this.state._height!,
      color: this.state.color!,
      className: this.props.className!,
    });

    const legendBars = this._createLegends(points);
    const donutMarginHorizontal = this.props.hideLabels ? 0 : 80;
    const donutMarginVertical = this.props.hideLabels ? 0 : 40;
    const outerRadius =
      Math.min(this.state._width! - donutMarginHorizontal, this.state._height! - donutMarginVertical) / 2;
    const chartData = this._elevateToMinimums(points.filter((d: IChartDataPoint) => d.data! >= 0));
    const valueInsideDonut = this._valueInsideDonut(this.props.valueInsideDonut!, chartData!);
    return !this._isChartEmpty() ? (
      <div
        className={this._classNames.root}
        ref={(rootElem: HTMLElement | null) => (this._rootElem = rootElem)}
        onMouseLeave={this._handleChartMouseLeave}
      >
        <FocusZone direction={FocusZoneDirection.horizontal} handleTabKey={FocusZoneTabbableElements.all}>
          <div>
            <svg
              className={this._classNames.chart}
              aria-label={data?.chartTitle}
              ref={(node: SVGElement | null) => this._setViewBox(node)}
            >
              <Pie
                width={this.state._width!}
                height={this.state._height!}
                outerRadius={outerRadius}
                innerRadius={this.props.innerRadius!}
                data={chartData!}
                onFocusCallback={this._focusCallback}
                hoverOnCallback={this._hoverCallback}
                hoverLeaveCallback={this._hoverLeave}
                uniqText={this._uniqText}
                onBlurCallback={this._onBlur}
                activeArc={this._getHighlightedLegend()}
                focusedArcId={this.state.focusedArcId || ''}
                href={this.props.href!}
                calloutId={this._calloutId}
                valueInsideDonut={this._toLocaleString(valueInsideDonut)}
                theme={this.props.theme!}
                showLabelsInPercent={this.props.showLabelsInPercent}
                hideLabels={this.props.hideLabels}
              />
            </svg>
          </div>
        </FocusZone>
        <div
          style={{
            position: 'absolute',
            top: this.state.clickPosition.y,
            left: this.state.clickPosition.x,
            right: this.state.clickPosition.x,
            bottom: this.state.clickPosition.y,
            visibility: 'hidden',
          }}
          ref={el => (this._popoverTarget = el)}
        />
        <Popover
          positioning={{ position: 'above', align: 'start', target: this._popoverTarget }}
          open={this.state.isPopoverOpen}
          withArrow
          openOnHover
          inline
        >
          <PopoverSurface tabIndex={-1}>
            <ChartHoverCard
              Legend={this.state.xCalloutValue ? this.state.xCalloutValue : this.state.legend}
              YValue={this.state.yCalloutValue ? this.state.yCalloutValue : this.state.value}
              color={this.state.color}
              culture={this.props.culture}
            />
          </PopoverSurface>
        </Popover>
        {!hideLegend && <div className={this._classNames.legendContainer}>{legendBars}</div>}
      </div>
    ) : (
      <div
        id={this._emptyChartId!}
        role={'alert'}
        style={{ opacity: '0' }}
        aria-label={'Graph has no data to display'}
      />
    );
  }

  updatePosition(newX: number, newY: number) {
    const threshold = 1; // Set a threshold for movement
    const { x, y } = this.state.clickPosition;

    // const componentRect = this.pieRef;

    // Adjusting mouse coordinates
    // const relativeX = newX - componentRect.left;
    // const relativeY = newY - componentRect.top;

    // Calculate the distance moved
    const distance = Math.sqrt(Math.pow(newX - x, 2) + Math.pow(newY - y, 2));
    // Update the position only if the distance moved is greater than the threshold
    if (distance > threshold) {
      this.setState({ clickPosition: { x: newX, y: newY }, isPopoverOpen: true });
    }
  }

  public handlePopoverOpen = () => {
    this.setState({ isPopoverOpen: true });
  };

  handlePopoverClose = () => {
    this.setState({ isPopoverOpen: false });
  };

  private _elevateToMinimums(data: IChartDataPoint[]) {
    let sumOfData = 0;
    const minPercent = 0.01;
    const elevatedData: IChartDataPoint[] = [];
    data.forEach(item => {
      sumOfData += item.data!;
    });
    data.forEach(item => {
      elevatedData.push(
        minPercent * sumOfData > item.data! && item.data! > 0
          ? {
              ...item,
              data: minPercent * sumOfData,
              yAxisCalloutData:
                item.yAxisCalloutData === undefined ? item.data!.toLocaleString() : item.yAxisCalloutData,
            }
          : item,
      );
    });
    return elevatedData;
  }
  private _setViewBox(node: SVGElement | null): void {
    if (node === null) {
      return;
    }

    // const rect = node?.getBoundingClientRect();
    // this.pieRef = rect;

    const widthVal = node.parentElement ? node.parentElement.clientWidth : this.state._width;

    const heightVal =
      node.parentElement && node.parentElement?.offsetHeight > this.state._height!
        ? node.parentElement?.offsetHeight
        : this.state._height;
    const viewbox = `0 0 ${widthVal!} ${heightVal!}`;
    node.setAttribute('viewBox', viewbox);
  }
  private _createLegends(chartData: IChartDataPoint[]): JSX.Element {
    const legendDataItems = chartData.map((point: IChartDataPoint, index: number) => {
      const color: string = point.color!;
      // mapping data to the format Legends component needs
      const legend: ILegend = {
        title: point.legend!,
        color,
        action: () => {
          if (this.state.selectedLegend === point.legend) {
            this.setState({ selectedLegend: '' });
          } else {
            this.setState({ selectedLegend: point.legend! });
          }
        },
        hoverAction: () => {
          this._handleChartMouseLeave();
          this.setState({ activeLegend: point.legend! });
        },
        onMouseOutAction: () => {
          this.setState({ activeLegend: '' });
        },
      };
      return legend;
    });
    const legends = (
      <Legends
        legends={legendDataItems}
        centerLegends
        overflowProps={this.props.legendsOverflowProps}
        focusZonePropsInHoverCard={this.props.focusZonePropsForLegendsInHoverCard}
        overflowText={this.props.legendsOverflowText}
        {...this.props.legendProps}
      />
    );
    return legends;
  }

  private _focusCallback = (data: IChartDataPoint, id: string, element: SVGPathElement): void => {
    this.setState({
      /** Show the callout if highlighted arc is focused and Hide it if unhighlighted arc is focused */
      showHover: this.state.selectedLegend === '' || this.state.selectedLegend === data.legend,
      value: data.data!.toString(),
      legend: data.legend,
      color: data.color!,
      xCalloutValue: data.xAxisCalloutData!,
      yCalloutValue: data.yAxisCalloutData!,
      focusedArcId: id,
      dataPointCalloutProps: data,
      callOutAccessibilityData: data.callOutAccessibilityData!,
    });
  };

  private _hoverCallback = (data: IChartDataPoint, e: React.MouseEvent<SVGPathElement>): void => {
    if (this._calloutAnchorPoint !== data) {
      this._calloutAnchorPoint = data;
      const target = e.currentTarget as HTMLOrSVGElement;
      this.setState({ targetElement: target });
      if (!this.state.isPopoverOpen) {
        this.setState({ isPopoverOpen: true });
      }
      // const position = e.target.getBoundingClientRect();
      this.updatePosition(e.clientX, e.clientY);
      this.setState({ clickPosition: { x: e.clientX, y: e.clientY } });
      this.setState({
        /** Show the callout if highlighted arc is hovered and Hide it if unhighlighted arc is hovered */
        showHover: this.state.selectedLegend === '' || this.state.selectedLegend === data.legend,
        value: data.data!.toString(),
        legend: data.legend,
        color: data.color!,
        xCalloutValue: data.xAxisCalloutData!,
        yCalloutValue: data.yAxisCalloutData!,
        dataPointCalloutProps: data,
        callOutAccessibilityData: data.callOutAccessibilityData!,
      });
    }
  };
  private _onBlur = (): void => {
    this.setState({ focusedArcId: '' });
  };

  private _hoverLeave(): void {
    /**/
  }

  private _handleChartMouseLeave = () => {
    this._calloutAnchorPoint = null;
    this.setState({ showHover: false });
  };

  private _valueInsideDonut(valueInsideDonut: string | number | undefined, data: IChartDataPoint[]) {
    const highlightedLegend = this._getHighlightedLegend();
    if (valueInsideDonut !== undefined && (highlightedLegend !== '' || this.state.showHover)) {
      let legendValue = valueInsideDonut;
      data!.map((point: IChartDataPoint, index: number) => {
        if (point.legend === highlightedLegend || (this.state.showHover && point.legend === this.state.legend)) {
          legendValue = point.yAxisCalloutData ? point.yAxisCalloutData : point.data!;
        }
        return;
      });
      return legendValue;
    } else {
      return valueInsideDonut;
    }
  }

  private _toLocaleString(data: string | number | undefined) {
    const localeString = convertToLocaleString(data, this.props.culture);
    if (!localeString) {
      return data;
    }
    return localeString?.toString();
  }

  /**
   * This function returns
   * the selected legend if there is one
   * or the hovered legend if none of the legends is selected.
   * Note: This won't work in case of multiple legends selection.
   */
  private _getHighlightedLegend() {
    return this.state.selectedLegend || this.state.activeLegend;
  }

  private _isChartEmpty(): boolean {
    return !(
      this.props.data &&
      this.props.data.chartData &&
      this.props.data.chartData!.filter((d: IChartDataPoint) => d.data! > 0).length > 0
    );
  }

  private _addDefaultColors = (donutChartDataPoint?: IChartDataPoint[]): IChartDataPoint[] => {
    return donutChartDataPoint
      ? donutChartDataPoint.map((item, index) => {
          let color: string;
          // isInverted property is applicable to v8 themes only
          if (typeof item.color === 'undefined') {
            color = getNextColor(index, 0, this.props.theme?.isInverted);
          } else {
            color = getColorFromToken(item.color, this.props.theme?.isInverted);
          }

          return { ...item, color };
        })
      : [];
  };
}
