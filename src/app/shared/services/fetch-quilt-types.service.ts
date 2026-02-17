import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchQuiltTypesService implements OnDestroy {
  private unsubscribe: Subscription[] = [];
  quiltTypes: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  getQuiltTypes() {
    const allQuiltTypesSub = this.http.get(`${this.API_USERS_URL}/Generic/quilttypes`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.quiltTypes.next(res.data);
      } else {
        this.quiltTypes.next([])
      }
    })

    this.unsubscribe.push(allQuiltTypesSub);
  }

  // Method to get getQuiltTypesForSpecificRole
  getQuiltTypesForSpecificRole(orderTypeId: number) {
    return this.http.get(`${this.API_USERS_URL}/Generic/GetQuiltTypesAndCustFacingDesc?OrderTypeId=${orderTypeId}`);
  }


  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
