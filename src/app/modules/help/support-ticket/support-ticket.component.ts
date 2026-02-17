import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { HelpService } from '../help.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RegexService } from 'src/app/shared/services/regex.service';

@Component({
  selector: 'app-support-ticket',
  templateUrl: './support-ticket.component.html',
  styleUrls: ['./support-ticket.component.scss'],
})
export class SupportTicketComponent implements OnInit {
  public roleEnum = Roles;
  private unsubscribe: Subscription[] = [];
  @Input() userRole: Roles;
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  feedback: FormGroup;
  severityList: Array<any> = [];
  issueTypeList: Array<any> = [];
  browserList: Array<any> = [];
  addList: Array<any> = [];
  appModeList: Array<any> = [];
  mobileList: Array<any> = [];
  uploadedFile: any;
  uploadFileStack: Array<any> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private helpService: HelpService,
    private regexService: RegexService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    // if (this.tab === 'feedback') {
    this.initForm();
    // this.getBrowsers();
    this.getAppMode();
    this.getIssueType();
    this.getSeverity();
    // this.getMobilePlatform()
    // }
  }
  selectMode(id: any) {
    console.log(id);
  }
  onFileChange(event: any) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;

    if (input.files) {
      // const files: File[] = Array.from(input.files);
      // this.feedback.patchValue({ File: files[0] });
      const { files, value: file } = event.target;
      const fileExtention = file
        .substring(file.lastIndexOf(".") + 1)
        .toLowerCase();
      // this.feedback.get('file').setValue(file)
      // if (this.allowedFileFormats.includes(fileExtention)) {
      // this.showInvalidFileMsg = false;
      const fileName = files[0].name;
      const fileSize = files[0].size / 1024;
      if (fileSize < 10240) {
        this.uploadedFile = files[0];
        this.uploadFileStack.push(this.uploadedFile)

        this.feedback.patchValue({ File: files[0] });
      }
      else {
        this.toastr.error('File size exceeds maximum limit 10MB.');
      }
      // } else {
      //   this.showInvalidFileMsg = true;
      // }
    }
  }
  deletFile(arr: any[], index: number) { arr.splice(index, 1); }
  shouldShowOtherBrowser(): boolean {
    return this.feedback.get('BrowserUsed')?.value === 'other';
  }

  getSeverity() {
    this.spinner.show();

    this.helpService.getSeverityList().subscribe((res) => {
      if (res.statusCode === 200) {
        this.severityList = res.data;
        this.spinner.hide();
      } else {
        if (res.message) {
          this.severityList = [];
          this.toastr.error(res.message);
        }
      }
    });
  }
  getIssueType() {
    this.spinner.show();

    this.helpService.getissueTypeList().subscribe((res) => {
      if (res.statusCode === 200) {
        this.issueTypeList = res.data;
        this.spinner.hide();
      } else {
        if (res.message) {
          this.issueTypeList = [];
          this.toastr.error(res.message);
        }
      }
    });
  }
  getBrowsers() {
    this.spinner.show();

    this.helpService.getBrowserList().subscribe((res) => {
      if (res.statusCode === 200) {
        this.browserList = res.data;
        this.spinner.hide();
      } else {
        if (res.message) {
          this.browserList = [];
          this.toastr.error(res.message);
        }
      }
    });
  }
  getAppMode() {
    this.spinner.show();
    this.helpService.getAppMode().subscribe((res) => {
      if (res.statusCode === 200) {
        this.appModeList = res.data;
        this.spinner.hide();
      } else {
        if (res.message) {
          this.appModeList = [];
          this.toastr.error(res.message);
        }
      }
    });
  }

  getMobilePlatform() {
    this.spinner.show();
    this.helpService.getMobilePlatform().subscribe((res) => {
      if (res.statusCode === 200) {
        this.mobileList = res.data;
        this.spinner.hide();
      } else {
        if (res.message) {
          this.mobileList = [];
          this.toastr.error(res.message);
        }
      }
    });
  }

  onModeSelect(id: any) {
    const { mobilePlatform, browserUsed } = this.feedback.controls;

    if (id == '10539') {
      this.getMobilePlatform()
      mobilePlatform.setValidators(Validators.required);
      mobilePlatform.updateValueAndValidity();
      browserUsed.clearValidators();
      browserUsed.updateValueAndValidity();
    } else {
      this.getBrowsers()
      browserUsed.setValidators(Validators.required);
      browserUsed.updateValueAndValidity();
      mobilePlatform.clearValidators();
      mobilePlatform.updateValueAndValidity();
    }
  }

  initForm() {
    this.feedback = this.fb.group({
      summary: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      issueType: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      browserUsed: [''],
      otherBrowser: [''],
      contact: [null, [Validators.pattern(this.regexService.allPhoneNumber), Validators.maxLength(15)]],
      // file: [null],
      appMode: ['', [Validators.required]],
      date: [''],
      mobilePlatform: ['']
    });
  }

  wordLimit(str: string, event: any) {
    let count = 0
    count = event.target.value.split(' ').length;
    if ((str == 'textbox' && count > 500) || (str == 'text' && count > 100)) {
      this.toastr.error('You have exceed your text limit.');
    }
  }
  addFiles(id: any) {
    this.spinner.show();
    let formData = new FormData();
    formData.append("file", this.uploadedFile);
    const uploadUserGuideSub = this.helpService.uploadJiraFile(id, formData).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.uploadFileStack = []
        //if (res.message) {
        //  this.toastr.success(res.message);
        // }
      } else if (res.message) {
        this.toastr.error(res.message);
      }
    });
    this.unsubscribe.push(uploadUserGuideSub);
  }
  onSubmit(): void {
    const ticketForm = this.feedback
    if (this.feedback.valid && !this.feedback.pristine) {
      this.spinner.show();
      const body: any = {
        ...this.feedback.getRawValue(),
        mobilePlatform: !this.feedback.controls.mobilePlatform.value ? '-1' : this.feedback.controls.mobilePlatform.value,
        browserUsed: !this.feedback.controls.browserUsed.value ? '-1' : this.feedback.controls.browserUsed.value,
        otherBrowser: !this.feedback.controls.otherBrowser.value ? '-1' : this.feedback.controls.otherBrowser.value,
        date: moment(this.feedback.controls.date.value).format('YYYY-MM-DDTHH:mm:ss[Z]')
      }
      const addTicket = this.helpService.postJira(body).subscribe((res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.addList = res.data;
          if (this.uploadFileStack) {
            this.addFiles(res.data.issueKey)
          }
          this.initForm()
          this.spinner.hide();
          if (res?.message) {
            this.toastr.success(res.message);
          }
        } else if (res.message) {
          this.spinner.hide();
          this.addList = [];
          this.toastr.error(res.message);
        }
        this.unsubscribe.push(addTicket);
      });
    } else {
      this.feedback.markAllAsTouched();
      // this.toastr.error('Please enter a valid form inputs');
    }
  }
}