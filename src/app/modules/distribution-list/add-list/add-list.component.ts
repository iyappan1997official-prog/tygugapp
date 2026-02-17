import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, Observable, startWith, Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';
import { DistributionService } from '../distribution.service';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'app-add-list',
  templateUrl: './add-list.component.html',
  styleUrls: ['./add-list.component.scss'],
})
export class AddListComponent implements OnInit, OnDestroy {
  public roleEnum = Roles; loggedInUserRole: Roles;
  userDetails: any;
  addListForm: FormGroup;
  listId: number | string = this.activatedRoute?.snapshot?.params?.id;
  componentAccessFor: string = this.activatedRoute?.snapshot?.data?.componentAccessFor;
  allMembers: any[] = [];
  allScenarios: any[] = [];
  savedListDetails: any = {};
  selectedGroupMembers: any[] = [];
  distributionListMembers: any[] = [];
  private unsubscribe: Subscription[] = [];
  filteredOptions: Observable<any[]>;
  groupMemberSearchControl: FormControl = new FormControl("");

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private distributionService: DistributionService,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private router: Router,
    private userService: UsersService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0] || "";
    this.initForm();

    if (this.componentAccessFor === "add-list") {
      const { userFullName: ownerName, userId: ownerId } = this.authService?.getUserFromLocalStorage()?.data || {};
      this.addListForm.patchValue({ ownerId, ownerName });
    }
    this.fetchAllGroupMembers();
  }

  initForm() {
    this.addListForm = this.fb.group({
      id: 0,
      name: ["", [Validators.required]],
      ownerName: [{ value: "", disabled: true }],
      emailScenarioId: ["", Validators.required],
      ownerId: [{ value: "", disabled: true }],
    });
  }
  resetForm() {
    const addListForm = this.addListForm;
    if (!addListForm.pristine) {
      this.initForm();
      if (this.componentAccessFor === "add-list") {
        const { userFullName: ownerName, userId: ownerId } = this.authService?.getUserFromLocalStorage()?.data || {};
        this.addListForm.patchValue({ ownerId, ownerName });
      }
      this.selectedGroupMembers = [];
      this.distributionListMembers = [];
      this.allMembers = [];
      this.groupMemberSearchControl.reset("");
      this.fetchAllGroupMembers()
    }
  }
  fetchAllGroupMembers() {
    this.spinner.show();

    const groupMembersSub = this.userService.getAllUsers().subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.fetchScenarios();
        this.allMembers = this.sortResDataArray(res?.data, "email");
      } else {
        this.allMembers = [];
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message);
        }
      }
    })

    this.unsubscribe.push(groupMembersSub);
  }

  fetchScenarios() {
    const groupMembersSub = this.distributionService.getScenarios().subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.allScenarios = this.sortResDataArray(res?.data, "name");

        if (["edit-list"].includes(this.componentAccessFor)) {
          this.getListDetailsById();
        } else {
          this.spinner.hide();
        }
      } else {
        this.allScenarios = [];
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message);
        }
      }
    })

    this.unsubscribe.push(groupMembersSub);
  }

  sortResDataArray(data: any[], sortProperty: string): any[] {
    return data?.sort((a: any, b: any) => {
      const A = a[sortProperty]?.toUpperCase();
      const B = b[sortProperty]?.toUpperCase();

      if (A > B) {
        return 1;
      } else if (A < B) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  groupMembersDropDown() {
    this.filteredOptions = this.groupMemberSearchControl.valueChanges.pipe(
      debounceTime(2000),
      startWith(''),
      map(value => this._filter(this.groupMemberSearchControl.value))
    );
  }

  private _filter(inputValue: any): string[] {
    const filterValue = inputValue?.toLowerCase();
    const selectedOption = this.allMembers.filter((option: any) => option?.email?.toLowerCase().includes(filterValue));
    return selectedOption;
  }

  pushSelectedMember() {
    if (!!this.groupMemberSearchControl.value && this.checkForSelectedOption()) {
      this.selectedGroupMembers.push(this.groupMemberSearchControl.value);
      this.groupMemberSearchControl.reset("");
      this.addListForm.markAsDirty();
    }
  }

  checkForSelectedOption(): boolean {
    return this.allMembers.some(option => option?.email === this.groupMemberSearchControl.value);
  }

  removeMember(index: number) {
    this.selectedGroupMembers.splice(index, 1);
    this.addListForm.markAsDirty();
  }

  getListDetailsById() {
    this.spinner.show();
    const listDetailstSub = this.distributionService.getListDetailsById(+this.listId).subscribe(res => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.savedListDetails = res?.data;
        this.patchFormvalues();
      } else {
        this.router.navigate(["distribution-list"]);
        if (res.message) {
          this.toastrService.error(res.message)
        }
      }
    })
    this.unsubscribe.push(listDetailstSub);
    this.enableEditListFields();
  }

  enableEditListFields() {
    const addListForm = this.addListForm;
    const { name, emailScenarioId } = addListForm.controls;
    addListForm.disable();

    name.enable();
    emailScenarioId.enable();
  }

  patchFormvalues() {
    const listDetails = this.savedListDetails || {};

    if (!!listDetails) {
      const groupMembers: any[] = listDetails?.distributionListMembers;
      // const { name, emailScenarioId, ownerName, ownerId } = listDetails;
      const { firstName, lastName } = listDetails?.owner || {};

      if (groupMembers?.length) {
        groupMembers.forEach(member => this.selectedGroupMembers.push(member?.groupMember?.email));
      }

      this.addListForm.patchValue({ ...listDetails, ownerName: !!listDetails?.owner ? `${firstName} ${lastName}` : '' });
    }
    this.cd.detectChanges();
  }

  addList() {
    const addListForm = this.addListForm;
    if (addListForm.invalid || !this.selectedGroupMembers.length) {
      addListForm.markAllAsTouched();
      this.groupMemberSearchControl.markAsTouched();
    } else if (!this.addListForm.pristine) {
      this.callAddListApi();
    }
  }

  getGroupMembersId() {
    this.allMembers.forEach(member => {
      if (this.selectedGroupMembers.includes(member?.email)) {
        this.distributionListMembers.push({
          groupMemberId: member.id,
          groupMember: member
        })
      }
    })

    return this.distributionListMembers;
  }

  callAddListApi() {
    this.spinner.show();

    const body: any = {
      ...this.addListForm.getRawValue(),
      distributionListMembers: this.getGroupMembersId()
    };

    const addListSub = this.distributionService.addList(body)
      .subscribe((res: any) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.distributionListMembers = [];
          this.distributionService.allLists.next([]);
          if (this.componentAccessFor === "add-list") {
            this.spinner.hide();
            this.router.navigate(["distribution-list"]);
          } else {
            this.selectedGroupMembers = [];
            this.distributionListMembers = [];
            this.getListDetailsById();
            this.router.navigate(["distribution-list"]);
          }
          if (res?.message) {
            this.toastrService.success(res.message);
          }
        } else {
          this.spinner.hide();
          if (res?.message) {
            this.toastrService.error(res.message);
          }
        }
      });
    this.unsubscribe.push(addListSub);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
