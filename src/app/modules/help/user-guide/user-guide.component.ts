import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HelpService } from '../help.service';
import { ConfirmActionComponent } from 'src/app/shared/modules/confirm-action/component/confirm-action.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { Roles } from 'src/app/shared/roles/rolesVar';

@Component({
  selector: 'app-user-guide',
  templateUrl: './user-guide.component.html',
  styleUrls: ['./user-guide.component.scss']
})
export class UserGuideComponent implements OnInit, OnDestroy {
  private _items$ = new BehaviorSubject<[]>([]);
  public roleEnum = Roles;
  @Input() userRole: Roles;
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  private unsubscribe: Subscription[] = [];
  userGuideLink: string | undefined = undefined;
  allowedFileFormats: string[] = ["pdf", "doc", "docx", "mp4"];
  showInvalidFileMsg: boolean = false;
  uploadedFile: any;
  uploadedGuideFiles: any[] = [];
  get items$() {
    return this._items$.asObservable();
  }
  userGuide: FormGroup
  constructor(
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private helpService: HelpService,
    private ngbModal: NgbModal
  ) { }

  ngOnInit(): void {
    if (this.tab === "user-guide") {
      this.getUserGuide();
      this.initForm()
    }
  }

  initForm() {
    this.userGuide = this.fb.group({
      file: [""],
    })
  }

  getUserGuide() {
    this.spinner.show();

    const userGuideSub = this.helpService.getAllGuide().subscribe((res) => {
      if (res.statusCode === 200) {
        this._items$.next(res.data);
        
      } else {
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
      this.spinner.hide();
    })
    this.unsubscribe.push(userGuideSub);
  }

  // getUserGuide() {
  //   this.spinner.show();

  //   const userGuideSub = this.helpService.downloadUserGuide().subscribe((res) => {
  //     this.spinner.hide();
  //     if (res.statusCode === 200) {
  //       this.userGuideLink = res?.data;
  //       this.uploadedGuideFiles.push(this.userGuideLink)
  //       console.log(this.uploadedGuideFiles);        
  //     } else {
  //       this.userGuideLink = undefined;
  //     }
  //   })
  //   this.unsubscribe.push(userGuideSub);
  // }

  uploadUserGuide(event: any) {
    event.preventDefault();
    //  this.spinner.show();
    if (event.target.files.length > 0) {
      const { files, value: file } = event.target;
      const fileExtention = file
        .substring(file.lastIndexOf(".") + 1)
        .toLowerCase();
      this.userGuide.get('file').setValue(file)
      if (this.allowedFileFormats.includes(fileExtention)) {
        this.showInvalidFileMsg = false;
        const fileName = files[0].name;
        const fileSize = files[0].size / 1024;
        if (fileSize < 10240) {
          this.uploadedFile = files[0];
          this.callUploadUserGuideApi();
        }
        else {
          this.toastr.error('File size exceeds maximum limit 10MB.');
        }
      } else {
        this.showInvalidFileMsg = true;
      }
    }
  }

  callUploadUserGuideApi() {
    this.spinner.show();
    let formData = new FormData();
    formData
    formData.append("file", this.uploadedFile);
    console.log(formData, this.uploadedFile);

    const uploadUserGuideSub = this.helpService.uploadUserGuide(formData).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.getUserGuide();
        if (res.message) {
          this.toastr.success(res.message);
        }
      } else if (res.message) {
        this.toastr.error(res.message);
      }
    });
    this.unsubscribe.push(uploadUserGuideSub);
  }

  viewUserGuide(url: any) {
    this.userGuideLink = url
    window.open(this.userGuideLink)
  }

  downloadFile(id: number, fileName: string, docType: string) {
    this.spinner.show();
    const downloadFileSub = this.helpService.downloadGuide(id).subscribe((res: any) => {
      debugger;
      if (res.statusCode === 200) {
        this.userFileDownload(res.data, fileName, docType);
        
        if (res.message) {
          this.toastr.success(res.message);
        }
      } else {
        if (res.message) {
          this.toastr.error(res.message);
        }
      }
      this.spinner.hide();
    })
    this.unsubscribe.push(downloadFileSub);
  }

  userFileDownload(data: any, fileName: string, docType: string) {
    const byteArray: any = new Uint8Array(atob(data).split('').map((char) => char.charCodeAt(0)));

    let blob = new Blob([byteArray], { type: docType });
    if (docType === "application/pdf") {
      FileSaver.saveAs(blob, `${fileName}.pdf`);
    } else if (docType === "video/mp4") {
      FileSaver.saveAs(blob, `${fileName}.mp4`);
    } else if (docType === "application/msword") {
      FileSaver.saveAs(blob, `${fileName}.doc`);
    }

  }

  openConfirmDeleteModal(id: number) {
    const modalRef = this.ngbModal.open(ConfirmActionComponent, {
      size: "md",
      centered: true,
    })

    modalRef.result.then(() => {
      this.deleteUserGuide(id);
    }).catch((res) => { })
  }

  deleteUserGuide(id: number) {
    this.spinner.show();
    const deleteFaqSub = this.helpService.removeUserGuide(id)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.getUserGuide();
          
          if (res.message) {
            this.toastr.success(res.message);
          }
        } else {
          if (res.message) {
            this.toastr.error(res.message);
          }
        }
      }
      );
    this.unsubscribe.push(deleteFaqSub);
  }

  // deleteUserGuide(event: any) {
  //   this.spinner.show();
  //   const deleteFaqSub = this.helpService.deleteUserGuide()
  //     .subscribe((res: any) => {
  //       this.spinner.hide();
  //       if (res.statusCode === 200) {
  //         this.userGuideLink = undefined;
  //         console.log(event);

  //         // this.uploadedGuideFiles.splice()
  //         if (res.message) {
  //           this.toastr.success(res.message);
  //         }
  //       } else {
  //         if (res.message) {
  //           this.toastr.error(res.message);
  //         }
  //       }
  //     }
  //     );
  //   this.unsubscribe.push(deleteFaqSub);
  // }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
