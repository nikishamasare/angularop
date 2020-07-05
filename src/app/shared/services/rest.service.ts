import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(private http: HttpClient) { }

  get(url: string, pathParam?: any, queryParam?: any, options?: any): Observable<any> {
    return this.http.get<any>(url, options);
  }

}
