// Minimal types for the parts of d3-geo the site uses (the Impact page footprint map
// and globe). d3-geo ships without types and @types/d3-geo isn't installed.
declare module "d3-geo" {
  export type GeoPermissibleObjects = object;
  type Point = [number, number];
  export interface GeoProjection {
    (point: Point): Point | null;
    fitExtent(extent: [Point, Point], object: GeoPermissibleObjects): this;
    rotate(angles: [number, number, number]): this;
    translate(point: Point): this;
    scale(k: number): this;
    clipAngle(angle: number): this;
  }
  export interface GeoPath {
    (object: GeoPermissibleObjects): string | null;
  }
  export function geoEqualEarth(): GeoProjection;
  export function geoOrthographic(): GeoProjection;
  export function geoPath(projection?: GeoProjection, context?: CanvasRenderingContext2D): GeoPath;
  export function geoGraticule10(): GeoPermissibleObjects;
  export function geoDistance(a: Point, b: Point): number;
}
