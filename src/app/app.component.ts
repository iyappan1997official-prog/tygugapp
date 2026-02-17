import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'quilt-tracker';
  showSidebar$ = new BehaviorSubject<any>(false);
  hideSideBarOn: string[] = [
    "/auth/login",
    "/auth/reset-password",
    "/auth/forgot-password"
  ]

  constructor(
    private router: Router
  ) { };
  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (this.hideSideBarOn.includes(event.url)) {
        this.showSidebar$.next(null);
      } else {
        this.showSidebar$.next(true);
      }
    });
  }
}
