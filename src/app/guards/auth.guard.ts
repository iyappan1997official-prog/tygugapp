import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../modules/auth/auth.service';
import { Roles } from '../shared/roles/rolesVar';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivateChild {
  public roleEnum = Roles;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const authData = this.authService.getAuthFromLocalStorage();
    const userRole = this.authService.getUserFromLocalStorage();

    if (authData && ![this.roleEnum.customerUser, this.roleEnum.serviceUser, this.roleEnum.consignUser].includes(userRole?.data?.roles[0])) {
      // logged in so return false
      this.router.navigate(["/dashboard"]);
      return false;
    }

    return true;
  }

}
