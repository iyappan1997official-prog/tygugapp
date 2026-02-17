import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchReconcileQuiltStatusService {
  private unsubscribe: Subscription[] = [];
  reconcileQuiltTypes: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  getQuiltTypes() {
    const allQuiltTypesSub = this.http.get(`${this.API_USERS_URL}/Generic/quiltstatusesForReconcile`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.reconcileQuiltTypes.next(res.data);
      } else {
        this.reconcileQuiltTypes.next([])
      }
    })

    this.unsubscribe.push(allQuiltTypesSub);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
