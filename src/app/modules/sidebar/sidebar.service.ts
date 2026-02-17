import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  sidebarNumbers: BehaviorSubject<any> = new BehaviorSubject<any>({});
  private unsubscribe: Subscription[] = [];
  API_USERS_URL = `${environment.apiUrl}`

  // getUpdateCount() {
  //   this.getTotalQuiltsCounts().subscribe((res) => {
  //     if (res.statusCode == 200) {
  //       // this.sidebarNumbers = res.data;
  //       this.sidebarNumbers.next(res.data)
  //     }
  //   })
  //   console.log(this.sidebarNumbers);
  //   return this.sidebarNumbers;
  // }

  constructor(private http: HttpClient) { }

  getTotalQuiltsCounts() {
    // return this.http.get<any>(`${this.API_USERS_URL}/inventory/TotalQuilts`);
    const allSidebarNumbers = this.http.get(`${this.API_USERS_URL}/inventory/TotalQuilts`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.sidebarNumbers.next(res.data);
      } else {
        this.sidebarNumbers.next([])
      }
    });
    this.unsubscribe.push(allSidebarNumbers);
  }
}
