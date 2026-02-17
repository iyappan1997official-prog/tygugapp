import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchOrderTypesService implements OnDestroy {
  private unsubscribe: Subscription[] = [];
  orderTypes: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  getAllTypes() {
    const allTypesSub = this.http.get(`${this.API_USERS_URL}/Generic/ordertypes`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.orderTypes.next(res.data);
      } else {
        this.orderTypes.next([])
      }
    })

    this.unsubscribe.push(allTypesSub);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
