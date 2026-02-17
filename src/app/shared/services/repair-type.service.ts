import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RepairTypeService implements OnDestroy {
  private unsubscribe: Subscription[] = [];
  repairTypes$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  loadRepairTypes() {
    const sub = this.http.get(`${this.API_URL}/RepairTypes`).subscribe((res: any) => {
      if (res && res.data) {
        this.repairTypes$.next(res.data);
      } else {
        this.repairTypes$.next([]);
      }
    });
    this.unsubscribe.push(sub);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
