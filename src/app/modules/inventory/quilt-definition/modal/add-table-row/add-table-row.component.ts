import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RegexService } from 'src/app/shared/services/regex.service';
import { InventoryService } from '../../../inventory.service';

@Component({
  selector: 'app-add-table-row',
  templateUrl: './add-table-row.component.html',
  styleUrls: ['./add-table-row.component.scss']
})
export class AddTableRowComponent implements OnInit, OnDestroy {
  @Input() addRowFor: string;
  @Input() componentAccessFor: string;
  @Input() rowId: number;
  private subscriptions: Subscription[] = [];

  addRow: FormGroup = this.fb.group({
    id: 0,
    description: "",
    type: ["", [Validators.required]],
    // partNumber: "",
    // maxPallet: ["", [Validators.max(999999999)]],
    construction: "",
    size: ""
  })

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private quiltService: InventoryService,
    private regexService: RegexService
  ) { }

  ngOnInit(): void {
    const { description, partNumber, maxPallet, construction, size } = this.addRow.controls;

    if (this.addRowFor === "definition") {
      description.setValidators([Validators.required]);
      // partNumber.setValidators([Validators.required]);
      // maxPallet.setValidators([Validators.required]);
    } else if (this.addRowFor === "size") {
      size.setValidators([Validators.required]);
    } else {
      construction.setValidators([Validators.required]);
    }

    if (this.componentAccessFor === "edit") {
      this.getQuiltRowById();
    }
  }


  getQuiltRowById() {
    this.spinner.show();

    const quiltRowData = this.quiltService.getQuiltRowById(`inventory/quilt-${this.addRowFor}/${this.rowId}`).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.addRow.patchValue(res.data);
      } else {
        this.modal.dismiss();
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.subscriptions.push(quiltRowData);
  }

  callAddRow() {
    if (this.addRow.invalid) {
      this.addRow.markAllAsTouched();
    } else {
      this.modal.close(this.addRow.getRawValue());
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
