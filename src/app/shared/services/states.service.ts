import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatesService implements OnDestroy {
  // private unsubscribe: Subscription[] = [];
  allStates: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  getAllStates(countryId?: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Generic/state/${+countryId}`);
  }

  // getAllStates(countryCode: number | string) {
  //   const statesSub = this.http.get(`${this.API_USERS_URL}/Generic/state/${+countryCode}`).subscribe((res: any) => {
  //     if (res.statusCode === 200) {
  //       const sortedStatesList: any = res?.data?.sort((a: any, b: any) => {
  //         const A = a.value?.toUpperCase();
  //         const B = b.value?.toUpperCase();

  //         if (A > B) {
  //           return 1;
  //         } else if (A < B) {
  //           return -1;
  //         } else {
  //           return 0;
  //         }
  //       });

  //       this.allStates.next(sortedStatesList)
  //     } else {
  //       this.allStates.next([])
  //     }
  //   })

  //   this.unsubscribe.push(statesSub);
  // }

  ngOnDestroy() {
    //   this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
