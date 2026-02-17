import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RepairTypeService } from 'src/app/shared/services/repair-type.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-update-status-modal',
  templateUrl: './update-status-modal.component.html',
  styleUrls: ['./update-status-modal.component.scss']
})
export class UpdateStatusModalComponent implements OnInit, OnDestroy {
  @Input() allStatus: any[] = [];        // full list from parent (id, name)
  @Input() serviceRole: boolean;
  @Input() retiredSelected: boolean = false;
  @Input() fromPallet: boolean;
  @Input() currentStatusId: number;


  quiltStatusId: FormControl = new FormControl("", [Validators.required]);
  retiredStatusId: FormControl = new FormControl("", []);

  // now int ids instead of strings
  selectedRepairTypes: number[] = [];
  repairTypes: any[] = [];
  groupedRepairTypes: { category: string, items: any[] }[] = [];
  filteredStatus: any[] = [];
  private allowedStatusNames = ['cleaning', 'inactive', 'on hand', 'repairing', 'retired'];
  private sub: Subscription;

  constructor(
    public modal: NgbActiveModal,
    private repairTypeService: RepairTypeService
  ) { }

  ngOnInit(): void {
    // load repair types dynamically
    this.repairTypeService.loadRepairTypes();
    this.sub = this.repairTypeService.repairTypes$.subscribe(types => {
      this.repairTypes = types || [];
      // ⭐ build hierarchy for UI
      this.buildRepairTypeHierarchy();
      this.quiltStatusId.setValue(this.currentStatusId);
      this.filteredStatus = this.applyStatusRules(this.currentStatusId);

    });
    //const found = this.allStatus.filter(s =>
    //  this.allowedStatusNames.includes((s.name || '').toString().trim().toLowerCase())
    //);
    //this.filteredStatus = (found && found.length) ? found : this.allStatus.slice();

    const current = this.quiltStatusId.value;
    if (current === 7) {
      this.enableRetired();
    } else {
      this.disableRetired();
    }
  }

  private buildRepairTypeHierarchy() {

    type RepairGroup = 'Repairing' | 'Retiring' | 'Cleaning' | 'Others';

    const groups: Record<RepairGroup, any[]> = {
      Repairing: [],
      Retiring: [],
      Cleaning: [],
      Others: []
    };

    for (const type of this.repairTypes) {

      switch (type.defaultStatusId) {

        case 9:
          groups.Repairing.push(type);
          break;

        case 7:
          groups.Retiring.push(type);
          break;

        case 6:
          groups.Cleaning.push(type);
          break;

        default:
          groups.Others.push(type);
          break;
      }
    }

    // convert to UI array
    this.groupedRepairTypes = (Object.keys(groups) as RepairGroup[])
      .filter(key => groups[key].length > 0)
      .map(key => ({
        category: key,
        items: groups[key]
      }));
  }

  callUpdateStatus() {
    const resObject = {
      quiltStatusId: this.quiltStatusId.value,
      retiredStatusId: this.retiredSelected ? (this.retiredStatusId.value || 0) : 0,
      quiltRepairTypes: this.selectedRepairTypes // now int[]
    };

    if (this.quiltStatusId.invalid) {
      this.quiltStatusId.markAsTouched();
      return;
    }
    if (this.retiredSelected && this.retiredStatusId.invalid) {
      this.retiredStatusId.markAsTouched();
      return;
    }
    this.modal.close(resObject);
  }

  // multi-select change
  repairTypeSelect(selectedIds: number[]) {
    this.selectedRepairTypes = selectedIds || [];

    if (!this.selectedRepairTypes.length) {
      this.resetAllowedStatuses();
      return;
    }

    // map repairTypes → priority by backend defaultStatusId
    const selectedObjs = this.repairTypes.filter(rt => this.selectedRepairTypes.includes(rt.repairTypeId));
    const statusIds = selectedObjs.map(rt => rt.defaultStatusId);

    let priorityId: number | null = null;
    if (statusIds.includes(7)) priorityId = 7;
    else if (statusIds.includes(9)) priorityId = 9;
    else if (statusIds.includes(6)) priorityId = 6;

    if (priorityId) {
      const matched = this.allStatus.filter(s => s.id === priorityId);
      this.filteredStatus = matched.length ? matched : this.getAllowedStatuses();
      this.quiltStatusId.setValue(priorityId);
      this.itemSelect(priorityId);
    } else {
      this.resetAllowedStatuses();
    }
  }

  itemSelect(id: any) {
    if (id === 7) this.enableRetired();
    else this.disableRetired();
  }

  private enableRetired() {
    this.retiredSelected = true;
    this.retiredStatusId.setValidators([Validators.required]);
    this.retiredStatusId.updateValueAndValidity();
  }

  private disableRetired() {
    this.retiredSelected = false;
    this.retiredStatusId.clearValidators();
    this.retiredStatusId.setValue(0);
    this.retiredStatusId.updateValueAndValidity();
  }

  private resetAllowedStatuses() {
    this.filteredStatus = this.getAllowedStatuses();
    this.quiltStatusId.reset();
    this.itemSelect(null);
  }

  private getAllowedStatuses() {
    const found = this.allStatus.filter(s =>
      this.allowedStatusNames.includes((s.name || '').toString().trim().toLowerCase())
    );
    return (found && found.length) ? found : this.allStatus.slice();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  private applyStatusRules(currentId: number) {

    // Always remove Inspection (ID = 5)
    let cleanList = this.allStatus.filter(s => s.id !== 5);

    // Cleaning (ID = 6) → On Hand (4), Retired (7), Repairing (9)
    if (currentId === 6) {
      return cleanList.filter(s => [4, 7, 9].includes(s.id));
    }

    // Repairing (ID = 9) → On Hand (4), Retired (7)
    if (currentId === 9) {
      return cleanList.filter(s => [4, 7].includes(s.id));
    }

    if (currentId === 4) {
      return cleanList.filter(s => s.id !== 4);
    }
    // Default → return everything except Inspection
    return cleanList;
  }

}


//import { Component, Input, OnInit, OnDestroy } from '@angular/core';
//import { FormControl, Validators } from '@angular/forms';
//import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
//import { RepairTypeService } from 'src/app/shared/services/repair-type.service';
//import { Subscription } from 'rxjs';

//@Component({
//  selector: 'app-update-status-modal',
//  templateUrl: './update-status-modal.component.html',
//  styleUrls: ['./update-status-modal.component.scss']
//})
//export class UpdateStatusModalComponent implements OnInit, OnDestroy {
//  @Input() allStatus: any[] = [];        // full list from parent (id, name)
//  @Input() serviceRole: boolean;
//  @Input() retiredSelected: boolean = false;
//  @Input() fromPallet: boolean;
//  @Input() currentStatusId: number;


//  quiltStatusId: FormControl = new FormControl("", [Validators.required]);
//  retiredStatusId: FormControl = new FormControl("", []);

//  // now int ids instead of strings
//  selectedRepairTypes: number[] = [];
//  repairTypes: any[] = [];
//  groupedRepairTypes: { category: string, items: any[] }[] = [];
//  filteredStatus: any[] = [];

//  private allowedStatusNames = ['cleaning', 'inactive', 'on hand', 'repairing', 'retired'];
//  private sub: Subscription;

//  constructor(
//    public modal: NgbActiveModal,
//    private repairTypeService: RepairTypeService
//  ) { }

//  ngOnInit(): void {
//    // load repair types dynamically
//    this.repairTypeService.loadRepairTypes();
//    this.sub = this.repairTypeService.repairTypes$.subscribe(types => {
//      this.repairTypes = types || [];
//      // ⭐ build hierarchy for UI
//      this.buildRepairTypeHierarchy();
//      this.quiltStatusId.setValue(this.currentStatusId);
//      this.filteredStatus = this.applyStatusRules(this.currentStatusId);
//      this.filterRepairTypesByStatus(this.currentStatusId);

//    });
//    //const found = this.allStatus.filter(s =>
//    //  this.allowedStatusNames.includes((s.name || '').toString().trim().toLowerCase())
//    //);
//    //this.filteredStatus = (found && found.length) ? found : this.allStatus.slice();

//    const current = this.quiltStatusId.value;
//    if (current === 7) {
//      this.enableRetired();
//    } else {
//      this.disableRetired();
//    }
//  }

//  private buildRepairTypeHierarchy() {

//    type RepairGroup = 'Repairing' | 'Retiring' | 'Cleaning' | 'Others';

//    const groups: Record<RepairGroup, any[]> = {
//      Repairing: [],
//      Retiring: [],
//      Cleaning: [],
//      Others: []
//    };

//    for (const type of this.repairTypes) {

//      switch (type.defaultStatusId) {

//        case 9:
//          groups.Repairing.push(type);
//          break;

//        case 7:
//          groups.Retiring.push(type);
//          break;

//        case 6:
//          groups.Cleaning.push(type);
//          break;

//        default:
//          groups.Others.push(type);
//          break;
//      }
//    }

//    // convert to UI array
//    this.groupedRepairTypes = (Object.keys(groups) as RepairGroup[])
//      .filter(key => groups[key].length > 0)
//      .map(key => ({
//        category: key,
//        items: groups[key]
//      }));
//  }

//  callUpdateStatus() {
//    const resObject = {
//      quiltStatusId: this.quiltStatusId.value,
//      retiredStatusId: this.retiredSelected ? (this.retiredStatusId.value || 0) : 0,
//      quiltRepairTypes: this.selectedRepairTypes // now int[]
//    };

//    if (this.quiltStatusId.invalid) {
//      this.quiltStatusId.markAsTouched();
//      return;
//    }
//    if (this.retiredSelected && this.retiredStatusId.invalid) {
//      this.retiredStatusId.markAsTouched();
//      return;
//    }
//    this.modal.close(resObject);
//  }

//  // multi-select change
//  repairTypeSelect(selectedIds: number[]) {
//    this.selectedRepairTypes = selectedIds || [];

//    if (!this.selectedRepairTypes.length) {
//      this.resetAllowedStatuses();
//      return;
//    }

//  //  // map repairTypes → priority by backend defaultStatusId
//  //  const selectedObjs = this.repairTypes.filter(rt => this.selectedRepairTypes.includes(rt.repairTypeId));
//  //  const statusIds = selectedObjs.map(rt => rt.defaultStatusId);

//  //  let priorityId: number | null = null;
//  //  if (statusIds.includes(7)) priorityId = 7;
//  //  else if (statusIds.includes(9)) priorityId = 9;
//  //  else if (statusIds.includes(6)) priorityId = 6;

//  //  if (priorityId) {
//  //    const matched = this.allStatus.filter(s => s.id === priorityId);
//  //    this.filteredStatus = matched.length ? matched : this.getAllowedStatuses();
//  //    this.quiltStatusId.setValue(priorityId);
//  //    this.itemSelect(priorityId);
//  //  } else {
//  //    this.resetAllowedStatuses();
//  //  }
//  }

//  itemSelect(id: number) {

//    // retired dropdown logic
//    if (id === 7) this.enableRetired();
//    else this.disableRetired();

//    // ⭐ filter repair types based on status
//    this.filterRepairTypesByStatus(id);
//  }

//  private filterRepairTypesByStatus(statusId: number) {

//    // On Hand (4) OR Inactive (2) → show all groups
//    if (statusId === 4 || statusId === 2 || !statusId) {
//      this.buildRepairTypeHierarchy();
//      this.selectedRepairTypes = [];
//      return;
//    }

//    let category = '';
//    let filtered: any[] = [];

//    if (statusId === 6) {        // Cleaning
//      category = 'Cleaning';
//      filtered = this.repairTypes.filter(x => x.defaultStatusId === 6);
//    }
//    else if (statusId === 9) {   // Repairing
//      category = 'Repairing';
//      filtered = this.repairTypes.filter(x => x.defaultStatusId === 9);
//    }
//    else if (statusId === 7) {   // Retired
//      category = 'Retiring';
//      filtered = this.repairTypes.filter(x => x.defaultStatusId === 7);
//    }
//    else {
//      this.buildRepairTypeHierarchy();
//      return;
//    }

//    this.groupedRepairTypes = [{
//      category: category,
//      items: filtered
//    }];

//    this.selectedRepairTypes = [];
//  }
//  private getStatusName(id: number): string {

//    switch (id) {
//      case 6: return 'Cleaning';
//      case 7: return 'Retiring';
//      case 9: return 'Repairing';
//      default: return 'Repair Type';
//    }
//  }
//  private enableRetired() {
//    this.retiredSelected = true;
//    this.retiredStatusId.setValidators([Validators.required]);
//    this.retiredStatusId.updateValueAndValidity();
//  }

//  private disableRetired() {
//    this.retiredSelected = false;
//    this.retiredStatusId.clearValidators();
//    this.retiredStatusId.setValue(0);
//    this.retiredStatusId.updateValueAndValidity();
//  }

//  private resetAllowedStatuses() {
//    this.filteredStatus = this.getAllowedStatuses();
//    this.quiltStatusId.reset();
//    this.itemSelect(null);
//  }

//  private getAllowedStatuses() {
//    const found = this.allStatus.filter(s =>
//      this.allowedStatusNames.includes((s.name || '').toString().trim().toLowerCase())
//    );
//    return (found && found.length) ? found : this.allStatus.slice();
//  }

//  ngOnDestroy() {
//    if (this.sub) this.sub.unsubscribe();
//  }

//  private applyStatusRules(currentId: number) {

//    // Always remove Inspection (ID = 5)
//    let cleanList = this.allStatus.filter(s => s.id !== 5);

//    // Cleaning (ID = 6) → On Hand (4), Retired (7), Repairing (9)
//    if (currentId === 6) {
//      return cleanList.filter(s => [4, 7, 9].includes(s.id));
//    }

//    // Repairing (ID = 9) → On Hand (4), Retired (7)
//    if (currentId === 9) {
//      return cleanList.filter(s => [4, 7].includes(s.id));
//    }

//    if (currentId === 4) {
//      return cleanList.filter(s => s.id !== 4);
//    }
//    // Default → return everything except Inspection
//    return cleanList;
//  }

//}
