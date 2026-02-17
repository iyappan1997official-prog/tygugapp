import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-action',
  templateUrl: './confirm-action.component.html',
  styleUrls: ['./confirm-action.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class ConfirmActionComponent implements OnInit {
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
  @Input() data: any;


  constructor(public modal: NgbActiveModal) { }

  ngOnInit(): void {
  }
  confirm() {
    this.modal.close();
  }
}
