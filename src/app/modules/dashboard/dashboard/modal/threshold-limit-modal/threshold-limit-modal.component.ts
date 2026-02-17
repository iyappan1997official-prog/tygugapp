import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'app-threshold-limit-modal',
  templateUrl: './threshold-limit-modal.component.html',
  styleUrls: ['./threshold-limit-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThresholdLimitModalComponent implements OnInit {
  thresholdQuantity: number;
  locationName: string;
  partNumber: string;
  customerFacingDescription: string;
  requestAccept: boolean = false;
  requestReject: boolean = false;
  thresholdId: number;

  constructor(
    public modal: NgbActiveModal,
    private spinner: NgxSpinnerService,

  ) { }

  ngOnInit(): void {
    console.log(this.customerFacingDescription);

  }
  requestBtn(str: string) {
    if (str == 'accept') {
      this.requestAccept = true;
    } else {
      this.requestReject = true;
    }
    const result = { requestAccept: this.requestAccept, requestReject: this.requestReject, thresholdId: this.thresholdId }
    this.modal.close(result)
  }
}
