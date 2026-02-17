import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { HelpService } from '../help.service';

@Component({
  selector: 'app-add-faq-modal',
  templateUrl: './add-faq-modal.component.html',
  styleUrls: ['./add-faq-modal.component.scss']
})
export class AddFaqModalComponent implements OnInit {
  @Input() addFaqFor: string = "mobile";
  @Input() componentAccessFor: string = "add";
  @Input() faqId: number;
  private subscriptions: Subscription[] = [];

  addFaqForm: FormGroup = this.fb.group({
    id: 0,
    applicationId: 1,
    question: ["", Validators.required],
    answer: ["", Validators.required]
  })

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private helpService: HelpService
  ) { }

  ngOnInit(): void {
    if (this.componentAccessFor === "edit") {
      this.getQuiltRowById();
    }

    if (this.addFaqFor === "web") {
      this.addFaqForm.controls.applicationId.patchValue(2);
    }
  }

  getQuiltRowById() {
    this.spinner.show();

    const quiltRowData = this.helpService.getFaqById(this.faqId).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.addFaqForm.patchValue(res.data);
      } else {
        this.modal.dismiss();
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.subscriptions.push(quiltRowData);
  }

  callAddFaq() {
    if (this.addFaqForm.invalid) {
      this.addFaqForm.markAllAsTouched();
    } else {
      this.modal.close(this.addFaqForm.getRawValue());
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
