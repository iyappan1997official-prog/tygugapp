import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../../modules/auth/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthModel } from 'src/app/modules/auth/models/auth.model';
import { ActionPopupComponent } from '../modules/action-popups/component/action-popup.component';


@Injectable({
    providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

    constructor(
        private spinner: NgxSpinnerService,
        private toastrService: ToastrService,
        private authService: AuthService,
        private ngbModal: NgbModal,
    ) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authData: any = JSON.parse(localStorage.getItem('token'));
        let headers = req.headers;
        if (req.url.indexOf('https://maps.google.com') > -1) {
        } else {

            headers = headers.append('Authorization', `Bearer ${authData && authData.token}`);
        }
        let newReq = req.clone({ headers: headers });
        return next.handle(newReq)
            .pipe(
                map(event => {
                    if (event instanceof HttpResponse && event.headers.has("Set-Authorization")) {
                        // set refreshed token when half of the token ValidFrom has elapsed.
                        let auth = new AuthModel();
                        auth.token = event.headers.get("Set-Authorization");
                        this.authService.setAuthFromLocalStorage(auth);
                    }
                    return event;
                }),
                catchError(err => {
                    debugger
                    this.spinner.hide();
                    this.spinner.hide("spinner2");
                    if(err.status===429){
                        this.toastrService.error(err.error.Message);
                    }
                    if (err.status === 401) {
                        console.log(localStorage);
                        if (localStorage.length !== 0){
                            this.authService.logout();
                            this.toastrService.error("Session Expired.");
                        }
                        else{
                            if(err && err.error && err.error.message)
                                this.toastrService.error(err.error.message);
                            // else
                            //     this.toastrService.error('Attempted to perform an unauthorized operation.');
                        }
                        this.authService.logoutInternal();
                        // if(err.url.indexOf('logout')==-1){
                        //     this.authService.logout();
                        // }
                        return throwError(err);
                    } else {
                        if (err instanceof HttpErrorResponse && err.error instanceof Blob && err.error.type === "application/blob") {
                            return new Promise<any>((resolve, reject) => {
                                let reader = new FileReader();
                                reader.onload = (e: Event) => {
                                    try {
                                        const errmsg = JSON.parse((<any>e.target).result);
                                        reject(new HttpErrorResponse({
                                            error: errmsg,
                                            headers: err.headers,
                                            status: err.status,
                                            statusText: err.statusText,
                                            // url: err.url
                                        }));
                                    } catch (e) {
                                        reject(err);
                                    }
                                };
                                reader.onerror = (e) => {
                                    reject(err);
                                };
                                reader.readAsText(err.error);
                            });
                        }
                        if (err.error.errorType === "Toast") {
                            this.toastrService.error(err?.error?.message ? err?.error?.message : 'Something went wrong. Please try again later.');
                        }
                        throw err;
                    }
                })
            );

    }
}
