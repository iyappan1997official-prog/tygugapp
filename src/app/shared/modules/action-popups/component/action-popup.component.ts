import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-action-popup',
  templateUrl: './action-popup.component.html',
  styleUrls: ['./action-popup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ActionPopupComponent implements OnInit {
  @Input() id: number;
  @Input() body: string = "Please confirm that you want to delete this record?";
  @Input() title: string = "Delete Record";
  @Input() confirmBtnText: string = "Yes";
  @Input() cancelBtnText: string = "Cancel";
  @Input() confirmBtnColor: string = "primary";
  @Input() cancelBtnColor: string = "secondary";
  @Input() showBackButton: boolean = true;
  @Input() showConfirmButton: boolean = true;
  @Input() summarytext: string;
  @Input() isSuccess: boolean = false;
  @Input() data: string;
  @Input() errorDetails: any;
  arrCheck: boolean = false;
  constructor(public modal: NgbActiveModal) { }

  ngOnInit(): void {
    debugger
  }
  confirm() {
    this.modal.close();
  }
}
