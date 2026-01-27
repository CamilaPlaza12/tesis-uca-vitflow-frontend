import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

export type ArGeoData = {
  provinces: Province[];
};

export type Province = {
  id: string;
  name: string;
  cities: City[];
};

export type City = {
  id: string;
  name: string;
  localidades: string[];
};

@Injectable({ providedIn: 'root' })
export class GeoArService {
  private readonly data$: Observable<ArGeoData>;

  constructor(private http: HttpClient) {
    this.data$ = this.http
      .get<ArGeoData>('/assets/geo/ar-geo-mini.json')
      .pipe(shareReplay(1));
  }

  getProvinces(): Observable<Province[]> {
    return this.data$.pipe(map((d) => d.provinces));
  }

  findProvinceByName(name: string | null | undefined): Observable<Province | null> {
    const n = (name ?? '').trim().toLowerCase();
    if (!n) return this.data$.pipe(map(() => null));

    return this.data$.pipe(
      map((d) => d.provinces.find((p) => p.name.toLowerCase() === n) ?? null)
    );
  }

  findCityByName(provinceName: string, cityName: string | null | undefined): Observable<City | null> {
    const c = (cityName ?? '').trim().toLowerCase();
    if (!c) return this.data$.pipe(map(() => null));

    return this.findProvinceByName(provinceName).pipe(
      map((p) => (p?.cities.find((x) => x.name.toLowerCase() === c) ?? null))
    );
  }
}
