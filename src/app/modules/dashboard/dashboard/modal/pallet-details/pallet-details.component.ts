import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pallet-details',
  templateUrl: './pallet-details.component.html',
  styleUrls: ['./pallet-details.component.scss']
})
export class PalletDetailsComponent {

  @Input() palletData: any;

  constructor(public activeModal: NgbActiveModal) { }
}
