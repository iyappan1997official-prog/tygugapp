import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchQuiltStatusesService implements OnDestroy {
  private unsubscribe: Subscription[] = [];
  allQuiltStatuses: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  getQuiltStatuses() {
    const allQuiltStatusesSub = this.http.get(`${this.API_USERS_URL}/Generic/quiltstatuses`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.allQuiltStatuses.next(res.data);
      } else {
        this.allQuiltStatuses.next([])
      }
    })

    this.unsubscribe.push(allQuiltStatusesSub);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}