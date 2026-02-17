import { HttpClient } from '@angular/common/http';
import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneratePdfService {
  private unsubscribe: Subscription[] = [];
  allCountries: BehaviorSubject<any> = new BehaviorSubject([]);
  API_USERS_URL = `${environment.apiUrl}`

  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private sanitizer: DomSanitizer
  ) { }

  rePrintQrCodeBySerialNumber(serialNumbers: string[]) {
    this.spinner.show();
    const printQrCodeSub = this.http.post(`${this.API_USERS_URL}/Codes/GenratePalletQRCodesPdf`, serialNumbers).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.printPdfFile(res?.data);
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message);
        }
      }
    });

    this.unsubscribe.push(printQrCodeSub);
  }

  genrateSeriesQRCodes(serialNumber: string | number) {
    this.spinner.show();
    const generateQrCodeSeriesSub = this.http.get(`${this.API_USERS_URL}/Codes/GenrateSeriesQRCodes?seriesId=${serialNumber}`).subscribe((res: any) => {
      this.spinner.hide();

      if (res.statusCode === 200) {
        this.printPdfFile(res?.data);
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message);
        }
      }
    });

    this.unsubscribe.push(generateQrCodeSeriesSub);
  }
  getBillOfLading(shipmentId: number) {
    this.spinner.show();
     const generateBillOfLading=this.http.get<any>(`${this.API_USERS_URL}/Codes/GenerateBillOfLading?shipmentId=${shipmentId}`).subscribe((res: any) => {
      this.spinner.hide();

      if (res.statusCode === 200) {
        this.printPdfFile(res?.data);
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message);
        }
      }
    });
    this.unsubscribe.push(generateBillOfLading);
  }
  genrateQuiltQrCode(quiltSerialNumber: string | number) {
    this.spinner.show();
    const generateQuiltQrCode = this.http.get(`${this.API_USERS_URL}/Codes/GenrateQuiltQRCode?serialNumber=${quiltSerialNumber}`).subscribe((res: any) => {
      this.spinner.hide();

      if (res.statusCode === 200) {
        this.printPdfFile(res?.data);
      } else {
        this.spinner.hide();
        if (res.message) {
          this.toastrService.error(res.message);
        }
      }
    });

    this.unsubscribe.push(generateQuiltQrCode);
  }

  printPdfFile(fileBytes: string) {
    const byteArray: any = new Uint8Array(atob(fileBytes).split('').map((char) => char.charCodeAt(0)));
    const pdf = new Blob([byteArray], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(pdf);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl));
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        iframe.focus();
        iframe.contentWindow.print();
        this.spinner.hide();
      });
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }
}