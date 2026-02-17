import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DistributionService {
  API_USERS_URL = `${environment.apiUrl}`
  allLists: BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(private http: HttpClient) { }

  getListDetailsById(listId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Distribution/${listId}`);
  }

  addList(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Distribution`, payload);
  }

  distributionListing(filterObj: any): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Distribution?SearchBy=${filterObj.searchBy}&SortByColumn=${filterObj.sortByColumn}&SortDescendingOrder=${filterObj.SortDescendingOrder}&PageNumber=${filterObj.pageNumber}&PageSize=${filterObj.pageSize}`);
  }

  removeList(listId: string | number): Observable<any> {
    return this.http.delete<boolean>(`${this.API_USERS_URL}/Distribution/${listId}`, {});
  }

  getScenarios(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Distribution/scenarios`);
  }
}
