import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchCustomersService implements OnDestroy {
  private unsubscribe: Subscription[] = [];
  allCustomers: BehaviorSubject<any> = new BehaviorSubject([]);
  globalAdminCustomer :BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  getAllCustomers(status: boolean, statusForCustomer: boolean) {
    const allCustomersSub = this.http.get(`${this.API_USERS_URL}/CustGroup/GetAllCustGroups?onlyOpenOrdersRequired=${status}&fetchAvailableCustomersForGroup=${statusForCustomer}`).subscribe((res: any) => {
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

        this.allCustomers.next(sortedRolesList)
      } else {
        this.allCustomers.next([])
      }
    })

    this.unsubscribe.push(allCustomersSub);
  }

  // getAllCustomersInGlobalCustomer(status: boolean, statusForCustomer: boolean) {
  //   const allCustomersSub = this.http.get(`${this.API_USERS_URL}/Customers/GetAllCustomers?onlyOpenOrdersRequired=${status}&fetchAvailableCustomersForGroup=${statusForCustomer}`).subscribe((res: any) => {
  //     if (res.statusCode === 200) {
  //       const sortedRolesList: any = res?.data?.sort((a: any, b: any) => {
  //         const A = a?.name?.toUpperCase();
  //         const B = b?.name?.toUpperCase();

  //         if (A > B) {
  //           return 1;
  //         } else if (A < B) {
  //           return -1;
  //         } else {
  //           return 0;
  //         }
  //       });

  //       this.allCustomers.next(sortedRolesList)
  //     } else {
  //       this.allCustomers.next([])
  //     }
  //   })

  //   this.unsubscribe.push(allCustomersSub);
  // }


  getAllCustomersInGlobalCustomer(customGroupRequired: boolean) {
    const allCustomersSub = this.http.get(`${this.API_USERS_URL}/Generic/CustGroups?customGroupRequired=${customGroupRequired}`).subscribe((res: any) => {
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

        this.allCustomers.next(sortedRolesList)
      } else {
        this.allCustomers.next([])
      }
    })

    this.unsubscribe.push(allCustomersSub);
  }


  getAllCustomersInGlobalAdmin() {
    const allCustomersSub = this.http.get(`${this.API_USERS_URL}/Generic/CustGroupsForGlobalAdmin`).subscribe((res: any) => {
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

        this.globalAdminCustomer.next(sortedRolesList)
      } else {
        this.globalAdminCustomer.next([])
      }
    })

    this.unsubscribe.push(allCustomersSub);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
