import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FetchCustomerOrderService {
  private unsubscribe: Subscription[] = [];
  allCustomersOrders: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`


  constructor(
    private http: HttpClient
  ) { }

  getAllCustomersWithOrder() {
    const allCustomersSub = this.http.get(`${this.API_USERS_URL}/CustGroup/GetCustGroupsWithOrder`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        const sortedRolesList: any = res?.data?.sort((a: any, b: any) => {
          const A = a?.name?.toUpperCase();
          const B = b?.name?.toUpperCase();

          if (A > B) {
            return 1;
          } else if (A < B) {
            return -1;
          } else {
            return 0;
          }
        });

        this.allCustomersOrders.next(sortedRolesList)
      } else {
        this.allCustomersOrders.next([])
      }
    })

    this.unsubscribe.push(allCustomersSub);
  }
  getAllCustomerHaveUsers() {
    const allCustomersSub = this.http.get(`${this.API_USERS_URL}/CustGroup/GetCustGroupsHaveUsers`).subscribe((res: any) => {
      if (res.statusCode === 200) {
       
        this.allCustomersOrders.next(res.data)
      } else {
        this.allCustomersOrders.next([])
      }
    })
    this.unsubscribe.push(allCustomersSub);
  }
  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
