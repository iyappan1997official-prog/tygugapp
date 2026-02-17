import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-close-order-modal',
  templateUrl: './close-order-modal.component.html',
  styleUrls: ['./close-order-modal.component.scss']
})
export class CloseOrderModalComponent implements OnInit {

  constructor(public modal: NgbActiveModal) { }

  ngOnInit(): void {
  }
  passToClose() {
    return this.modal.close(this);
  }

}
