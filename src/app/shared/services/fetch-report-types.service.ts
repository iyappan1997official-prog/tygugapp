import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class FetchReportTypesService {
  private unsubscribe: Subscription[] = [];
  reportTypes: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(private http:HttpClient,
    private spinner: NgxSpinnerService) { }

  getAllReportTypes() {
    this.spinner.show();
    const allReportTypesSub = this.http.get(`${this.API_USERS_URL}/Generic/ReportType`).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.reportTypes.next(res.data);
      } else {
        this.reportTypes.next([])
      }
    })

    this.unsubscribe.push(allReportTypesSub);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
