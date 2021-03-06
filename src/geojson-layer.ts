import * as React from 'react';
import * as MapboxGL from 'mapbox-gl/dist/mapbox-gl';
import { generateID } from './util/uid';
import { Sources, SourceOptionData } from './util/types';

export interface Props {
  id?: string;
  data: SourceOptionData;
  sourceOptions: MapboxGL.VectorSource | MapboxGL.RasterSource | MapboxGL.GeoJSONSource | MapboxGL.GeoJSONSourceRaw;
  before?: string;
  fillLayout?: MapboxGL.FillLayout;
  symbolLayout?: MapboxGL.SymbolLayout;
  circleLayout?: MapboxGL.CircleLayout;
  lineLayout?: MapboxGL.LineLayout;
  linePaint?: MapboxGL.LinePaint;
  symbolPaint?: MapboxGL.SymbolPaint;
  circlePaint?: MapboxGL.CirclePaint;
  fillPaint?: MapboxGL.FillPaint;
}

type Paints = MapboxGL.LinePaint | MapboxGL.SymbolPaint | MapboxGL.CirclePaint | MapboxGL.FillPaint;
type Layouts = MapboxGL.FillLayout | MapboxGL.LineLayout | MapboxGL.CircleLayout | MapboxGL.SymbolLayout;

export interface Context {
  map: MapboxGL.Map;
}

export default class GeoJSONLayer extends React.Component<Props, void> {
  public context: Context;

  public static contextTypes = {
    map: React.PropTypes.object
  };

  private id: string = this.props.id || `geojson-${generateID()}`;

  private source: Sources = {
    type: 'geojson',
    ...this.props.sourceOptions,
    data: this.props.data
  };

  private layerIds: string[] = [];

  private createLayer = (type: string) => {
    const { id, layerIds } = this;
    const { before } = this.props;
    const { map } = this.context;

    const layerId = `${id}-${type}`;
    layerIds.push(layerId);

    const paint: Paints = this.props[`${type}Paint`] || {};
    const layout: Layouts = this.props[`${type}Layout`] || {};

    map.addLayer({
      id: layerId,
      source: id,
      type,
      paint,
      layout
    }, before);
  }

  public componentWillMount() {
    const { id, source } = this;
    const { map } = this.context;

    map.addSource(id, source);

    this.createLayer('symbol');
    this.createLayer('line');
    this.createLayer('fill');
    this.createLayer('circle');
  }

  public componentWillUnmount() {
    const { id, layerIds } = this;
    const { map } = this.context;

    map.removeSource(id);

    layerIds.forEach((lId) => map.removeLayer(lId));
  }

  public componentWillReceiveProps(props: Props) {
    const { id } = this;
    const { data } = this.props;
    const { map } = this.context;

    if (props.data !== data) {
      (map.getSource(id) as MapboxGL.GeoJSONSource).setData(props.data);
    }
  }

  public render() {
    return null;
  }
}
