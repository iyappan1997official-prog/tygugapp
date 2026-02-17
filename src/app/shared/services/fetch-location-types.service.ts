import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchLocationTypesService implements OnDestroy {
  private unsubscribe: Subscription[] = [];
  locationType: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  getAllLocationTypes() {
    const allLocaTypes = this.http.get(`${this.API_USERS_URL}/Generic/locationTypes`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.locationType.next(res.data);
      } else {
        this.locationType.next([])
      }
    })

    this.unsubscribe.push(allLocaTypes);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }

}
