import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { FaqsComponent } from '../faqs/faqs.component';
import { UserGuideComponent } from '../user-guide/user-guide.component';
import { FeedbackComponent } from '../feedback/feedback.component';
import { Roles } from 'src/app/shared/roles/rolesVar';

enum Tabs {
  'faqs' = 0,
  'user-guide' = 1,
  'feedback' = 2,
}

@Component({
  selector: 'app-help-tab',
  templateUrl: './help-tab.component.html',
  styleUrls: ['./help-tab.component.scss'],
})
export class HelpTabComponent implements OnInit {
  @ViewChild(FaqsComponent) faqComponent: FaqsComponent;
  @ViewChild(UserGuideComponent) userGuideComponent: UserGuideComponent;
  @ViewChild(FeedbackComponent) feedbackComponent: FeedbackComponent;
  loggedInUserRole: Roles;
  public roleEnum = Roles;

  tabChangeSub: Subscription;
  tabIndex: number | string = 0;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loggedInUserRole =
      this.authService?.getUserFromLocalStorage()?.data?.roles[0] || '';
    this.handleTabChangeSub();
  }

  checkisvalidUser(): boolean {
    // console.log(
    //   'Checking userRole',
    //   this.loggedInUserRole,
    //   this.roleEnum,
    //   [
    //     this.roleEnum.globalAdmin,
    //     this.roleEnum.customerAdmin,
    //     this.roleEnum.customerManager,
    //     this.roleEnum.customerUser,
    //     this.roleEnum.consignAdmin,
    //     this.roleEnum.consignManager,
    //     this.roleEnum.consignUser,
    //   ].includes(this.loggedInUserRole)
    // );
    return [
      this.roleEnum.globalAdmin,
      this.roleEnum.customerAdmin,
      this.roleEnum.customerManager,
      this.roleEnum.customerUser,
      this.roleEnum.consignAdmin,
      this.roleEnum.consignManager,
      this.roleEnum.consignUser,
    ].includes(this.loggedInUserRole);
  }

  handleTabChangeSub(): void {
    this.tabChangeSub = this.activatedRoute?.queryParams?.subscribe(
      (queryParams) => {
        const tab: any = queryParams as { tab: string };

        if (!!tab.tab) {
          this.tabIndex = Tabs[tab.tab];
        }
      }
    );
  }

  selectedTabChanged(event: any): void {
    const index: number = event.index;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: Tabs[event.index] },
    });

    if (index === 0) {
      this.faqComponent.getFaqs();
    } else if (index === 1) {
      this.userGuideComponent.getUserGuide();
    } else if (index === 2) {
      this.feedbackComponent.feedbackType();
    }
  }

  ngOnDestroy() {
    this.tabChangeSub?.unsubscribe();
  }
}
