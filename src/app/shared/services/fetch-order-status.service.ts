import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchOrderStatusService implements OnDestroy {
  private unsubscribe: Subscription[] = [];
  orderStatus: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  getAllStatus() {
    const allStatesSub = this.http.get(`${this.API_USERS_URL}/Generic/orderstatuses`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.orderStatus.next(res.data);
      } else {
        this.orderStatus.next([])
      }
    })

    this.unsubscribe.push(allStatesSub);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
