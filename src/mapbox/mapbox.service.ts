import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';

interface MapboxGeometry {
  type: string;
  coordinates: number[][];
}

interface MapboxRoute {
  distance: number;
  duration: number;
  geometry: MapboxGeometry;
}

interface MapboxDirectionsResponse {
  code: string;
  message?: string;
  routes?: MapboxRoute[];
}

@Injectable()
export class MapboxService {
  private readonly logger = new Logger(MapboxService.name);
  private readonly BASE_URL =
    'https://api.mapbox.com/directions/v5/mapbox/driving';

  constructor(private readonly configService: ConfigService) {}

  async getDirections(
    origin: [number, number],
    destination: [number, number],
  ): Promise<{
    distance: number;
    duration: number;
    geometry: MapboxGeometry;
  }> {
    const accessToken = this.configService.get<string>('MAPBOX_ACCESS_TOKEN');
    if (!accessToken) {
      this.logger.error('Missing MAPBOX_ACCESS_TOKEN in environment');
      throw new InternalServerErrorException('Mapbox access token is not set');
    }

    const originStr = `${origin[0]},${origin[1]}`;
    const destinationStr = `${destination[0]},${destination[1]}`;

    const url = `${this.BASE_URL}/${originStr};${destinationStr}?geometries=geojson&access_token=${accessToken}`;
    this.logger.debug(`Calling Mapbox Directions API: ${url}`);

    let res;
    try {
      res = await fetch(url);
    } catch (err) {
      this.logger.error('HTTP request to Mapbox failed', err);
      throw new InternalServerErrorException(
        'Failed to call Mapbox Directions API',
      );
    }

    if (!res.ok) {
      this.logger.error(
        `Mapbox returned HTTP ${res.status}: ${res.statusText}`,
      );
      throw new InternalServerErrorException(
        `Mapbox API error: ${res.status} ${res.statusText}`,
      );
    }

    let data: MapboxDirectionsResponse;
    try {
      data = await res.json();
    } catch (err) {
      this.logger.error('Failed to parse JSON from Mapbox', err);
      throw new InternalServerErrorException(
        'Invalid response from Mapbox API',
      );
    }

    // ✅ Check Mapbox "code"
    if (!data.code || data.code !== 'Ok') {
      const message = data.message || data.code || 'Unknown error';
      this.logger.error(`Mapbox API error: ${message}`);
      throw new InternalServerErrorException(`Mapbox error: ${message}`);
    }

    // ✅ Validate routes
    if (
      !data.routes ||
      !Array.isArray(data.routes) ||
      data.routes.length === 0
    ) {
      this.logger.error('Mapbox returned no routes');
      throw new InternalServerErrorException('No routes returned by Mapbox');
    }

    const route = data.routes[0];

    // ✅ Final sanity check
    if (
      !route ||
      typeof route.distance !== 'number' ||
      typeof route.duration !== 'number' ||
      !route.geometry ||
      route.geometry.type !== 'LineString' ||
      !Array.isArray(route.geometry.coordinates)
    ) {
      this.logger.error(
        'Invalid route data from Mapbox',
        JSON.stringify(route),
      );
      throw new InternalServerErrorException('Invalid route data from Mapbox');
    }

    return {
      distance: Math.round(route.distance),
      duration: Math.round(route.duration),
      geometry: route.geometry,
    };
  }
}
