import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { AddFaqModalComponent } from '../add-faq-modal/add-faq-modal.component';
import { HelpService } from '../help.service';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit, OnDestroy {
  public roleEnum = Roles;
  @Input() userRole: Roles;
  private unsubscribe: Subscription[] = [];
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  mobileQueCollapsed: any = false;
  mobileAppQueExpand: number;
  webAppQueExpand: number;
  webQueCollapsed: any = false;
  savedFaqs: any = {};

  constructor(
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private helpService: HelpService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this.tab === "faqs" || !this.tab) {
      this.getFaqs();
    }
  }

  mobileAppQueToggle(toggleTo: boolean, index: number) {
    this.mobileQueCollapsed = toggleTo;
    if (toggleTo === true) {
      this.mobileAppQueExpand = index;
    } else {
      this.mobileAppQueExpand = undefined;
    }
  }

  webAppQueToggle(toggleTo: boolean, index: number) {
    this.webQueCollapsed = toggleTo;
    if (toggleTo === true) {
      this.webAppQueExpand = index;
    } else {
      this.webAppQueExpand = undefined;
    }
  }

  getFaqs() {
    this.spinner.show();
    const faqListSub = this.helpService.getFaqs().subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.savedFaqs = res?.data;
      } else {
        this.savedFaqs = {};
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(faqListSub);
  }

  openAddFaqModal(addFaqFor: string = "mobile", option: string = "add", id?: number) {
    const modalRef = this.modalService.open(AddFaqModalComponent, {
      size: "md",
      centered: true,
      windowClass: "modal-dialog-centered",
    })

    modalRef.componentInstance.addFaqFor = addFaqFor;
    modalRef.componentInstance.faqId = id;
    modalRef.componentInstance.componentAccessFor = option;

    modalRef.result.then((res) => {
      this.spinner.show();
      this.callAddFaqApi(res);
    }).catch((res) => { })
  }

  callAddFaqApi(body: any) {
    const addFaqSub = this.helpService.addUpdateFaq(body).subscribe((res) => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        this.getFaqs();
        if (res.message) {
          this.toastr.success(res.message);
        }
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(addFaqSub);
  }


  openConfirmDeleteModal(faqId: number) {
    const modalRef = this.modalService.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
    })

    modalRef.result.then(() => {
      this.deleteFaq(faqId);
    }).catch((res) => { })
  }

  deleteFaq(faqId: any) {
    this.spinner.show();
    const deleteFaqSub = this.helpService.deleteFaq(faqId)
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.getFaqs();
        } else {
          this.spinner.hide();
          if (res.message) {
            this.toastr.error(res.message);
          }
        }
      }
      );
    this.unsubscribe.push(deleteFaqSub);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
