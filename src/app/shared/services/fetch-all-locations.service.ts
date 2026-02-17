import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FetchAllLocationsService implements OnDestroy {
  private unsubscribe: Subscription[] = [];
  allLocations: BehaviorSubject<any> = new BehaviorSubject([]);
  allConsignLocations: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`
  constructor(
    private http: HttpClient
  ) {
  }


  getAllLocationTypes() {
    const allLocat = this.http.get(`${this.API_USERS_URL}/Locations/GetAllLocations`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.allLocations.next(res.data);
      } else {
        this.allLocations.next([])
      }
    })

    this.unsubscribe.push(allLocat);
  }

  getConsignLocation() {
    const allLocat = this.http.get(`${this.API_USERS_URL}/Locations/GetConsignedLocations`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.allConsignLocations.next(res.data);
      } else {
        this.allConsignLocations.next([])
      }
    })

    this.unsubscribe.push(allLocat);
  }
  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }

}
