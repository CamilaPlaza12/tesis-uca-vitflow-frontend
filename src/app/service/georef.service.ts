import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';

export type GeoItem = { id: string; nombre: string };

@Injectable({ providedIn: 'root' })
export class GeorefService {
  private readonly baseUrl = 'https://apis.datos.gob.ar/georef/api';

  // Cache in-memory
  private provinces$?: Observable<GeoItem[]>;
  private localidadesCache = new Map<string, Observable<GeoItem[]>>();

  constructor(private http: HttpClient) {}

  /** ✅ Provincias: 1 sola vez (son 24) */
  getProvinces(): Observable<GeoItem[]> {
    if (this.provinces$) return this.provinces$;

    const params = new HttpParams()
      .set('campos', 'id,nombre')
      .set('max', '100')
      .set('orden', 'nombre');

    this.provinces$ = this.http.get<any>(`${this.baseUrl}/provincias`, { params }).pipe(
      map((r) => (r?.provincias ?? []).map((p: any) => ({ id: String(p.id), nombre: String(p.nombre) }))),
      shareReplay(1)
    );

    return this.provinces$;
  }

  /**
   * ✅ Localidades por provincia: se cachea por provinceId.
   * OJO: puede ser “grande”, pero es MUCHO mejor UX que ir tecla a tecla.
   */
  getLocalidadesByProvincia(provinceId: string): Observable<GeoItem[]> {
    const key = String(provinceId ?? '');
    if (!key) {
      return new Observable<GeoItem[]>((sub) => {
        sub.next([]);
        sub.complete();
      });
    }

    const cached = this.localidadesCache.get(key);
    if (cached) return cached;

    const params = new HttpParams()
      .set('provincia', key)
      .set('campos', 'id,nombre')
      .set('max', '5000')
      .set('orden', 'nombre');

    const req$ = this.http.get<any>(`${this.baseUrl}/localidades`, { params }).pipe(
      map((r) => (r?.localidades ?? []).map((l: any) => ({ id: String(l.id), nombre: String(l.nombre) }))),
      shareReplay(1)
    );

    this.localidadesCache.set(key, req$);
    return req$;
  }
}
