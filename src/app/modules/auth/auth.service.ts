import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { AuthHttpService } from './auth-http/auth-http.service';
import { AuthModel } from './models/auth.model';
import { UserModel } from './models/user.model';
import { jwtDecode } from "jwt-decode";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUserSubject: BehaviorSubject<any> = new BehaviorSubject({});
  masterUserSubject: BehaviorSubject<any> = new BehaviorSubject({});
  constructor(
    private router: Router,
    private authHttpService: AuthHttpService,
  ) { }

  login(payload: any): Observable<any> {
    return this.authHttpService.login(payload).pipe(
      map((res: any) => {
        debugger
        if(res && res.data){
          let auth = new AuthModel();
          auth.token = res?.data?.token;
          let decodedToken = jwtDecode<any>(auth.token);
          if(decodedToken){
            this.setAuthFromLocalStorage(auth);
            res.data.userId=decodedToken.nameid;
            res.data.roles=[decodedToken.role];
            res.data.email=decodedToken.unique_name;
            res.data.companyId=decodedToken.CompanyId;
            res.data.locationId=decodedToken.LocationId;
            res.data.custGroupId=decodedToken.CustGroupId;
            this.setUserFromLocalStorage(res);
            this.currentUserSubject.next(res);
          }
          
        }
        return res;
      }),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
    );
  }

  logout() {
    this.authHttpService.logoutData().subscribe({complete:()=>{
      localStorage.clear();
      this.router.navigate(['/auth/login']);
    }
  });
  }
   logoutInternal(){
    localStorage.clear();
      this.router.navigate(['/auth/login']);
  };
  public  setUserFromLocalStorage(user: UserModel): boolean {
    if (user) {
      localStorage.setItem("userDetails", JSON.stringify(user));
      return true;
    }
    return false;
  }

  getUserFromLocalStorage(): any {
    try {
      const authData = JSON.parse(`${localStorage.getItem("userDetails")}`
      );
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public setAuthFromLocalStorage(auth: AuthModel): any {
    if (auth && auth.token) {
      localStorage.setItem("token", JSON.stringify(auth));
      return true;
    }
    return false;
  }

  getAuthFromLocalStorage(): any {
    try {
      const authData = JSON.parse(`${localStorage.getItem("token")}`);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
