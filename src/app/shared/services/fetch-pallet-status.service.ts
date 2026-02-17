import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from '../../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchPalletStatusService implements OnDestroy {

  private unsubscribe: Subscription[] = [];
  allPalletStatuses: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  getPalletStatuses() {
    const allPalletStatusesSub = this.http.get(`${this.API_USERS_URL}/Generic/palletstatuses`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.allPalletStatuses.next(res.data);
      } else {
        this.allPalletStatuses.next([])
      }
    })

    this.unsubscribe.push(allPalletStatusesSub);
  }
  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
