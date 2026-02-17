import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject } from 'rxjs';
import { RepairService } from 'src/app/modules/repair/repair.service';
import {
  ServiceCenterSummaryRequest,
  ServiceCenterSummaryResponse,
  ServiceCenterLocationVM
} from './service-center-report.model';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-service-center-report',
  templateUrl: './service-center-report.component.html',
  styleUrls: ['./service-center-report.component.scss']
})
export class ServiceCenterReportComponent implements OnInit {

  serviceCenterForm!: FormGroup;
  expandedLocationIndex: number | null = null;
  expandedParts: { [key: string]: boolean } = {};
  expandedQuilts: { [key: string]: boolean } = {};
  reportData: any[] = [];
  isLoading = false;
  dateRangeDisplay: string = '';

  // Dropdown values
  allQuiltStatus = [
    { id: 1, name: 'Cleaned' },
    { id: 2, name: 'Retired' },
    { id: 3, name: 'Repaired' },
  ];

  // ===== STATIC COUNT BOX DATA (for now) =====
  usageData = {
    totalquilts:1,
    cleaning: 2,
    repairing: 1,
    retired: 0,
    grandtotalreturned: 3
  };

  // ===== TABLE DATA (STATIC for now) =====
  private _items$ = new BehaviorSubject<any[]>([]);
  originalReportData: any[] = [];

  get items$() {
    return this._items$.asObservable();
  }

  // ===== PAGINATION =====
  length = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25];

  // Drill-down toggle
  expandedIndex: number | undefined;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private repairService: RepairService
  ) { }

  //ngOnInit(): void {
  //  this.serviceCenterForm = this.fb.group({
  //    quiltStatusId: ['0'],
  //    pageNumber: 1,
  //    pageSize: 10
  //  });
  //  this.searchReport();
  //  // ✅ FORMAT DATE RANGE
  //  const start = moment(params['startDate']).format('MM/DD/YYYY');
  //  const end = moment(params['endDate']).format('MM/DD/YYYY');
  //  // ✅ FINAL STRING
  //  this.dateRangeDisplay = `${start} – ${end}`;
  //}
  ngOnInit(): void {

    this.serviceCenterForm = this.fb.group({
      quiltStatusId: ['0'],
      pageNumber: 1,
      pageSize: 10,
      startDate: null,
      endDate: null
    });

    this.route.queryParams.subscribe(params => {

      if (params['startDate'] && params['endDate']) {

        this.serviceCenterForm.patchValue({
          startDate: params['startDate'],
          endDate: params['endDate'],
          pageNumber: 1,
          pageSize: 10
        });

        // ✅ FORMAT DATE RANGE DISPLAY
        const start = moment(params['startDate']).format('MM/DD/YYYY');
        const end = moment(params['endDate']).format('MM/DD/YYYY');

        this.dateRangeDisplay = `${start} – ${end}`;
      }

      // call API after params applied
      this.searchReport();
    });
  }
  private buildPayload(): ServiceCenterSummaryRequest  {
    const form = this.serviceCenterForm.value;

    return {
      pageNumber: form.pageNumber,
      pageSize: form.pageSize,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      serviceCenterLocationIds: [],
      sortByColumn: "",
      sortDescendingOrder: true,
      searchBy: ""
    };
  }
  searchReport(): void {

    this.isLoading = true;

    const payload = this.buildPayload();

    this.repairService.getServiceCenterSummary(payload)
      .subscribe({
        next: (res: any) => {

          this.originalReportData = res.locations || [];

          const mapped = this.mapApiToUi(this.originalReportData);

          this._items$.next(mapped);

          this.calculateCards(this.originalReportData);

          this.length = res.pagingParameters?.totalCount || mapped.length;

          this.isLoading = false;
        },
        error: err => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  private mapApiToUi(locations: any[]): any[] {

    return locations.map(loc => ({
      location: loc.locationName,
      totalReturned: loc.returned,
      cleaningCount: loc.cleaned,
      repairingCount: loc.repaired,
      retringCount: loc.retired,

      quiltsUsageCustomer: (loc.parts || []).map((p: any) => ({
        partNumber: p.partNumber,
        totalReturned: p.returned,
        cleaningCount: p.cleaned,
        repairingCount: p.repaired,
        retringCount: p.retired,

        quilts: (p.quilts || []).map((q: any) => ({
          serialNumber: q.serialNumber,
          returned: q.returned,
          cleaned: q.cleaned,
          repaired: q.repaired,
          retired: q.retired
        }))
      }))
    }));
  }

  private calculateCards(locations: any[]) {

    let totalReturned = 0;
    let cleaned = 0;
    let repaired = 0;
    let retired = 0;

    locations.forEach((loc: any) => {
      totalReturned += loc.returned;
      cleaned += loc.cleaned;
      repaired += loc.repaired;
      retired += loc.retired;
    });

    this.usageData = {
      totalquilts: totalReturned,
      cleaning: cleaned,
      repairing: repaired,
      retired: retired,
      grandtotalreturned: totalReturned
    };
  }
  resetReport(): void {
    this.serviceCenterForm.reset({
      quiltStatusId: '0',
      pageNumber: 1,
      pageSize: 10
    });

    this.searchReport();
  }

  toggleRow(index: number) {
    this.expandedIndex = this.expandedIndex === index ? undefined : index;
  }

  paginator(event: PageEvent) {
    this.serviceCenterForm.patchValue({
      pageNumber: event.pageIndex + 1,
      pageSize: event.pageSize
    });
  }

  toggleLocationDetails(index: number): void {
    this.expandedLocationIndex = this.expandedLocationIndex === index ? null : index;
  }

  isPartExpanded(locationIndex: number, partIndex: number): boolean {
    return this.expandedParts[`${locationIndex}-${partIndex}`] === true;
  }

  togglePartDetails(locationIndex: number, partIndex: number): void {
    const key = `${locationIndex}-${partIndex}`;
    this.expandedParts[key] = !this.expandedParts[key];
  }

  toggleQuiltDetails(locIdx: number, partIdx: number, quiltIdx: number): void {
    const key = `${locIdx}-${partIdx}-${quiltIdx}`;
    this.expandedQuilts[key] = !this.expandedQuilts[key];
  }
  isQuiltExpanded(loc: number, part: number, quilt: number): boolean {
    return this.expandedQuilts[`${loc}-${part}-${quilt}`];
  }
  hasDetails(quilt: any): boolean {
    return (
      (quilt.repairTypes && quilt.repairTypes.trim() !== '' && quilt.repairTypes !== 'None') ||
      (quilt.retiredTypes && quilt.retiredTypes.trim() !== '' && quilt.retiredTypes !== 'None')
    );
  }
  //exportReport(): void {
  //  const dataToExport = this.originalReportData;
  //  if (!dataToExport || !dataToExport.length) {
  //    this.toastr.warning('No data available to export');
  //    return;
  //  }

  //  const exportRows: any[] = [];

  //  dataToExport.forEach((loc: any) => {

  //    /* ===== 1️⃣ LOCATION LEVEL ROW ===== */
  //    exportRows.push({
  //      'Location Name': loc.locationName || '',
  //      'Part Number': '',
  //      'Quilt Serial Number': '',
  //      'Cleaned': loc.cleanedCount || 0,
  //      'Repaired': loc.repairedCount || 0,
  //      'Retired': loc.retiredCount || 0,
  //      'Total': loc.totalReturned || 0,
  //      'Repair Summary': '',
  //      'Retire Summary': ''
  //    });

  //    const parts = loc.partNumbers || [];

  //    parts.forEach((p: any) => {

  //      /* ===== 2️⃣ PART LEVEL ROW ===== */
  //      exportRows.push({
  //        'Location Name': '',
  //        'Part Number': p.partNumber || '',
  //        'Quilt Serial Number': '',
  //        'Cleaned': p.cleaningCount || 0,
  //        'Repaired': p.repairedCount || 0,
  //        'Retired': p.retiredCount || 0,
  //        'Total': p.total || 0,
  //        'Repair Summary': '',
  //        'Retire Summary': ''
  //      });

  //      const quilts = p.quilts || [];

  //      quilts.forEach((q: any) => {

  //        /* ===== 3️⃣ QUILT LEVEL ROW ===== */
  //        exportRows.push({
  //          'Location Name': '',
  //          'Part Number': '',
  //          'Quilt Serial Number': q.serialNumber || '',
  //          'Cleaned': q.cleaned || 0,
  //          'Repaired': q.repaired || 0,
  //          'Retired': q.retired || 0,
  //          'Total': q.returned || 0,
  //          'Repair Summary': q.repairTypes || 'None',
  //          'Retire Summary': q.retiredTypes || 'None'
  //        });

  //      });
  //    });
  //  });

  //  const headers = [
  //    'Location Name',
  //    'Part Number',
  //    'Quilt Serial Number',
  //    'Cleaned',
  //    'Repaired',
  //    'Retired',
  //    'Total',
  //    'Repair Summary',
  //    'Retire Summary'
  //  ];

  //  const worksheet = XLSX.utils.json_to_sheet(exportRows, { header: headers });

  //  headers.forEach((header, index) => {
  //    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
  //    if (worksheet[cellAddress]) {
  //      worksheet[cellAddress].s = { font: { bold: true } };
  //    }
  //  });

  //  const workbook = XLSX.utils.book_new();
  //  XLSX.utils.book_append_sheet(workbook, worksheet, 'Repair Summary');

  //  const excelBuffer: any = XLSX.write(workbook, {
  //    bookType: 'xlsx',
  //    type: 'array'
  //  });

  //  const blob = new Blob([excelBuffer], {
  //    type: 'application/octet-stream'
  //  });

  //  saveAs(blob, `RepairSummaryReport_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
  //  this.toastr.success('Report exported successfully');
  //}
}
