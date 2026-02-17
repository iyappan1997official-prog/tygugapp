import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchUserRolesService implements OnDestroy {
  private unsubscribe: Subscription[] = [];
  allUserRoles: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  getAllRoles() {
    const userRolesSub = this.http.get(`${this.API_USERS_URL}/user/roles`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        // const sortedRolesList: any = res?.data?.sort((a: any, b: any) => {
        //   const A = a.value?.toUpperCase();
        //   const B = b.value?.toUpperCase();

        //   if (A > B) {
        //     return 1;
        //   } else if (A < B) {
        //     return -1;
        //   } else {
        //     return 0;
        //   }
        // });

        this.allUserRoles.next(res?.data)
      } else {
        this.allUserRoles.next([])
      }
    })

    this.unsubscribe.push(userRolesSub);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
