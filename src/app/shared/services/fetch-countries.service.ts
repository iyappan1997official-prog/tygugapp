import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchCountriesService {
  private unsubscribe: Subscription[] = [];
  allCountries: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  getAllCountries() {
    const contriesSub = this.http.get(`${this.API_USERS_URL}/Generic/country`).subscribe((res: any) => {
      if (res.statusCode === 200) {
        const sortedCountriesList: any = res?.data?.sort((a: any, b: any) => {
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

        this.allCountries.next(sortedCountriesList)
      } else {
        this.allCountries.next([])
      }
    })

    this.unsubscribe.push(contriesSub);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}
