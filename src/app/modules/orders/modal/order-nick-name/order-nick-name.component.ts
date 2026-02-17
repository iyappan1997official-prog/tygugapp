import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-order-nick-name',
  templateUrl: './order-nick-name.component.html',
  styleUrls: ['./order-nick-name.component.scss']
})
export class OrderNickNameComponent implements OnInit {
  @Input() id: number;
  @Input() orderNames: any[];
  @Input() editNickNameId: number;
  addName: boolean
  nickNameId: FormControl = new FormControl("");
  nickName: FormControl = new FormControl("");
  selectedName: string = ''
  constructor(public modal: NgbActiveModal) { }

  ngOnInit(): void {
    this.nickNameId.patchValue(this.editNickNameId)
    console.log(this.orderNames);

  }
  callNameUpdate() {
    let resObject = { orderId: this.id, nickNameId: this.nickNameId.value, nickName: !this.nickNameId.value ? this.selectedName || this.nickName.value : '' }
    if (this.nickNameId.invalid) {
      this.nickNameId.markAsTouched();
    } else {
      this.modal.close(resObject);
    }
  }
  itemSelect(id: any) {
    if (id === 0) {
      this.addName = true;
      this.nickName.setValidators([Validators.required])
      this.nickName.updateValueAndValidity()
    } else {
      let name = this.orderNames.find(x => x.id == id).name
      this.selectedName = name
    }
  }
}
