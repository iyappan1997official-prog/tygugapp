import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { RepairService } from 'src/app/modules/repair/repair.service';
import {
  ServiceCenterIcrReportRequest,
  ServiceCenterIcrReportResponse,
  ServiceCenterLocationVM
} from './service-center-report.model';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
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
  selectedExportType: 'hierarchical' | 'raw' | '' = '';
  exportTypeTouched = false;
  serviceCenterLocations: { id: number; name: string }[] = [];
  initialLocationId = 0;
  printRows: any[] = [];

  // ===== STATIC COUNT BOX DATA (for now) =====
  usageData = {
    totalquilts: 0,
    cleaning: 0,
    repairing: 0,
    retired: 0,
    grandtotalreturned: 0
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
  sortByColumn: 'location' | 'totalReturned' | 'cleaningCount' | 'repairingCount' | 'retringCount' | '' = '';
  sortDescendingOrder = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private repairService: RepairService,
    private toastr: ToastrService
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
      pageNumber: 1,
      pageSize: 10,
      startDate: null,
      endDate: null,
      locationId: 0
    });

    this.route.queryParams.subscribe(params => {

      if (params['startReceiveDate'] && params['endReceiveDate']) {
        this.initialLocationId = params['locationId'] ? Number(params['locationId']) : 0;

        this.serviceCenterForm.patchValue({
          startDate: params['startReceiveDate'],
          endDate: params['endReceiveDate'],
          locationId: this.initialLocationId,
          pageNumber: 1,
          pageSize: 10
        });

        // ✅ FORMAT DATE RANGE DISPLAY
        const start = moment(params['startReceiveDate']).format('MM/DD/YYYY');
        const end = moment(params['endReceiveDate']).format('MM/DD/YYYY');

        this.dateRangeDisplay = `${start} – ${end}`;
      }

      // call API after params applied
      this.searchReport();
    });
  }
  private buildPayload(): ServiceCenterIcrReportRequest {
    const form = this.serviceCenterForm.value;

    return {
      startReceiveDate: form.startDate || null,
      endReceiveDate: form.endDate || null,
      locationId: Number(form.locationId || 0)
    };
  }
  searchReport(): void {

    this.isLoading = true;

    const payload = this.buildPayload();

    this.repairService.getServiceCenterIcrReport(payload)
      .subscribe({
        next: (res: ServiceCenterIcrReportResponse) => {
          this.applyReportResponse(res, payload.locationId === this.initialLocationId);
          this.isLoading = false;
        },
        error: err => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  private applyReportResponse(res: ServiceCenterIcrReportResponse, updateLocationOptions = false): void {
    const reportData = res?.data;
    const locations = reportData?.locations || [];

    this.originalReportData = locations;

    const mapped = this.applyTopLevelSort(this.mapApiToUi(this.originalReportData));
    this._items$.next(mapped);
    this.calculateCards(reportData);
    this.length = mapped.length;
    this.preparePrintData();

    // Keep location filter options restricted to locations in the generated dataset.
    if (updateLocationOptions) {
      this.serviceCenterLocations = locations.map((loc: any) => ({
        id: loc.locationId,
        name: loc.locationName
      }));
    }
  }

  syncLatestData(): void {
    this.isLoading = true;
    const payload = this.buildPayload();
    let syncMessage = 'Synced successfully';

    this.repairService.syncServiceCenterIcrCycleReport()
      .pipe(
        tap((syncRes: any) => {
          if (syncRes?.message) {
            syncMessage = syncRes.message;
          }
        }),
        switchMap(() => this.repairService.getServiceCenterIcrReport(payload)),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (res: ServiceCenterIcrReportResponse) => {
          this.applyReportResponse(res, payload.locationId === this.initialLocationId);
          this.toastr.success(syncMessage);
        },
        error: err => {
          console.error(err);
          this.toastr.error(err?.error?.message || 'Failed to sync latest data');
        }
      });
  }

  private mapApiToUi(locations: ServiceCenterLocationVM[]): any[] {

    return locations.map(loc => ({
      location: loc.locationName,
      totalReturned: loc.totalReturned,
      cleaningCount: loc.totalCleaned,
      repairingCount: loc.totalRepaired,
      retringCount: loc.totalRetired,

      quiltsUsageCustomer: (loc.partNumbers || []).map((p: any) => ({
        partNumber: p.partNumber,
        totalReturned: p.totalReturned,
        cleaningCount: p.totalCleaned,
        repairingCount: p.totalRepaired,
        retringCount: p.totalRetired,

        quilts: (p.quilts || []).map((q: any) => ({
          serialNumber: q.serialNumber,
          returned: q.totalReturned,
          cleaned: q.totalCleaned,
          repaired: q.totalRepaired,
          retired: q.totalRetired,
          repairTypes: this.toRepairTypesText(q.repairTypeAggregates),
          cycles: (q.cycles || []).map((c: any) => ({
            icrCycle: c.icrCycle,
            status: c.status,
            returned: c.returned,
            cleaned: c.cleaned,
            repaired: c.repaired,
            retired: c.retired,
            repairTypes: this.toRepairTypesText(c.repairTypeAggregates)
          }))
        }))
      }))
    }));
  }

  private calculateCards(reportData: any): void {
    const totalQuilts = reportData?.totalQuilts || 0;
    const totalReturned = reportData?.totalReturned || 0;
    const totalCleaned = reportData?.totalCleaned || 0;
    const totalRepaired = reportData?.totalRepaired || 0;
    const totalRetired = reportData?.totalRetired || 0;

    this.usageData = {
      totalquilts: totalQuilts,
      cleaning: totalCleaned,
      repairing: totalRepaired,
      retired: totalRetired,
      grandtotalreturned: totalReturned
    };
  }

  private toRepairTypesText(aggregates: any[] | null | undefined): string {
    if (!aggregates || !aggregates.length) {
      return '';
    }

    return aggregates
      .map((item: any) => `${item.repairType} (${item.count})`)
      .join(', ');
  }
  resetReport(): void {
    // Reset should clear only report-screen location filtering and preserve generated report filters.
    this.serviceCenterForm.patchValue({
      locationId: this.initialLocationId,
      pageNumber: 1,
      pageSize: 10
    });

    this.searchReport();
  }

  toggleRow(index: number) {
    this.expandedIndex = this.expandedIndex === index ? undefined : index;
  }

  sortTopLevel(column: 'location' | 'totalReturned' | 'cleaningCount' | 'repairingCount' | 'retringCount'): void {
    if (this.sortByColumn === column) {
      this.sortDescendingOrder = !this.sortDescendingOrder;
    } else {
      this.sortByColumn = column;
      this.sortDescendingOrder = false;
    }

    const sorted = this.applyTopLevelSort(this._items$.value);
    this._items$.next(sorted);

    // Expanded row indexes/keys are tied to row order.
    this.expandedIndex = undefined;
    this.expandedParts = {};
    this.expandedQuilts = {};
  }

  private applyTopLevelSort(rows: any[]): any[] {
    if (!rows?.length || !this.sortByColumn) {
      return [...(rows || [])];
    }

    const key = this.sortByColumn;
    const direction = this.sortDescendingOrder ? -1 : 1;

    return [...rows].sort((a, b) => {
      const aValue = a?.[key];
      const bValue = b?.[key];

      if (key === 'location') {
        return (String(aValue || '')).localeCompare(String(bValue || '')) * direction;
      }

      return ((Number(aValue) || 0) - (Number(bValue) || 0)) * direction;
    });
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

  hasQuiltChildren(quilt: any): boolean {
    return (quilt?.cycles?.length || 0) > 0;
  }

  exportReport(): void {
    if (!this.originalReportData || !this.originalReportData.length) {
      return;
    }

    const exportRows: any[] = [];

    exportRows.push({
      Level: 'Top Level',
      Location: '',
      PartNumber: '',
      QuiltId: '',
      ICRCycle: '',
      Status: '',
      TotalQuilts: this.usageData.totalquilts || 0,
      TotalReturned: this.usageData.grandtotalreturned || 0,
      TotalCleaned: this.usageData.cleaning || 0,
      TotalRepaired: this.usageData.repairing || 0,
      TotalRetired: this.usageData.retired || 0,
      RepairTypeAggregates: ''
    });

    this.originalReportData.forEach((loc: any) => {
      exportRows.push({
        Level: 'Location',
        Location: loc.locationName || '',
        PartNumber: '',
        QuiltId: '',
        ICRCycle: '',
        Status: '',
        TotalQuilts: loc.totalQuilts || 0,
        TotalReturned: loc.totalReturned || 0,
        TotalCleaned: loc.totalCleaned || 0,
        TotalRepaired: loc.totalRepaired || 0,
        TotalRetired: loc.totalRetired || 0,
        RepairTypeAggregates: ''
      });

      (loc.partNumbers || []).forEach((part: any) => {
        exportRows.push({
          Level: 'PartNumber',
          Location: '',
          PartNumber: part.partNumber || '',
          QuiltId: '',
          ICRCycle: '',
          Status: '',
          TotalQuilts: part.totalQuilts || 0,
          TotalReturned: part.totalReturned || 0,
          TotalCleaned: part.totalCleaned || 0,
          TotalRepaired: part.totalRepaired || 0,
          TotalRetired: part.totalRetired || 0,
          RepairTypeAggregates: ''
        });

        (part.quilts || []).forEach((quilt: any) => {
          exportRows.push({
            Level: 'Quilt',
            Location: '',
            PartNumber: '',
            QuiltId: quilt.quiltId || '',
            ICRCycle: '',
            Status: '',
            TotalQuilts: '',
            TotalReturned: quilt.totalReturned || 0,
            TotalCleaned: quilt.totalCleaned || 0,
            TotalRepaired: quilt.totalRepaired || 0,
            TotalRetired: quilt.totalRetired || 0,
            RepairTypeAggregates: this.toRepairTypesText(quilt.repairTypeAggregates) || ''
          });

          (quilt.cycles || []).forEach((cycle: any) => {
            exportRows.push({
              Level: 'ICRCycle',
              Location: '',
              PartNumber: '',
              QuiltId: '',
              ICRCycle: cycle.icrCycle || '',
              Status: cycle.status || '',
              TotalQuilts: '',
              TotalReturned: cycle.returned || 0,
              TotalCleaned: cycle.cleaned || 0,
              TotalRepaired: cycle.repaired || 0,
              TotalRetired: cycle.retired || 0,
              RepairTypeAggregates: this.toRepairTypesText(cycle.repairTypeAggregates) || ''
            });
          });
        });
      });
    });

    const headers = [
      'Level',
      'Location',
      'PartNumber',
      'QuiltId',
      'ICRCycle',
      'Status',
      'TotalQuilts',
      'TotalReturned',
      'TotalCleaned',
      'TotalRepaired',
      'TotalRetired',
      'RepairTypeAggregates'
    ];

    const worksheet = XLSX.utils.json_to_sheet(exportRows, { header: headers });
    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { font: { bold: true } };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Service Center ICR');
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `ServiceCenterICRReport_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
  }

  exportRawLinearReport(): void {
    if (!this.originalReportData || !this.originalReportData.length) {
      return;
    }

    const rows: any[] = [];

    this.originalReportData.forEach((loc: any) => {
      (loc.partNumbers || []).forEach((part: any) => {
        (part.quilts || []).forEach((quilt: any) => {
          const cycles = quilt.cycles || [];

          if (!cycles.length) {
            rows.push({
              LocationId: loc.locationId || '',
              LocationName: loc.locationName || '',
              PartNumber: part.partNumber || '',
              QuiltId: quilt.quiltId || '',
              QuiltTotalReturned: quilt.totalReturned || 0,
              QuiltTotalCleaned: quilt.totalCleaned || 0,
              QuiltTotalRepaired: quilt.totalRepaired || 0,
              QuiltTotalRetired: quilt.totalRetired || 0,
              QuiltRepairTypeAggregates: this.toRepairTypesText(quilt.repairTypeAggregates) || '',
              ReportId: '',
              ICRCycle: '',
              Status: '',
              ReceiveDate: '',
              CompletionDate: '',
              LastStatusDate: '',
              Returned: '',
              Cleaned: '',
              Repaired: '',
              Retired: '',
              CycleRepairTypeAggregates: ''
            });
            return;
          }

          cycles.forEach((cycle: any) => {
            rows.push({
              LocationId: loc.locationId || '',
              LocationName: loc.locationName || '',
              PartNumber: part.partNumber || '',
              QuiltId: quilt.quiltId || '',
              QuiltTotalReturned: quilt.totalReturned || 0,
              QuiltTotalCleaned: quilt.totalCleaned || 0,
              QuiltTotalRepaired: quilt.totalRepaired || 0,
              QuiltTotalRetired: quilt.totalRetired || 0,
              QuiltRepairTypeAggregates: this.toRepairTypesText(quilt.repairTypeAggregates) || '',
              ReportId: cycle.reportId || '',
              ICRCycle: cycle.icrCycle || '',
              Status: cycle.status || '',
              ReceiveDate: cycle.receiveDate || '',
              CompletionDate: cycle.completionDate || '',
              LastStatusDate: cycle.lastStatusDate || '',
              Returned: cycle.returned || 0,
              Cleaned: cycle.cleaned || 0,
              Repaired: cycle.repaired || 0,
              Retired: cycle.retired || 0,
              CycleRepairTypeAggregates: this.toRepairTypesText(cycle.repairTypeAggregates) || ''
            });
          });
        });
      });
    });

    const headers = [
      'LocationId',
      'LocationName',
      'PartNumber',
      'QuiltId',
      'QuiltTotalReturned',
      'QuiltTotalCleaned',
      'QuiltTotalRepaired',
      'QuiltTotalRetired',
      'QuiltRepairTypeAggregates',
      'ReportId',
      'ICRCycle',
      'Status',
      'ReceiveDate',
      'CompletionDate',
      'LastStatusDate',
      'Returned',
      'Cleaned',
      'Repaired',
      'Retired',
      'CycleRepairTypeAggregates'
    ];

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { font: { bold: true } };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Service Center ICR Raw');
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `ServiceCenterICRRaw_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
  }

  exportSelectedReport(): void {
    this.exportTypeTouched = true;

    if (!this.selectedExportType) {
      return;
    }

    if (this.selectedExportType === 'hierarchical') {
      this.exportReport();
      return;
    }

    this.exportRawLinearReport();
  }

  preparePrintData(): void {
    const rows: any[] = [];

    this.originalReportData.forEach((loc: any) => {
      (loc.partNumbers || []).forEach((part: any) => {
        (part.quilts || []).forEach((quilt: any) => {
          const cycles = quilt.cycles || [];

          if (!cycles.length) {
            rows.push({
              locationName: loc.locationName || '',
              partNumber: part.partNumber || '',
              serialNumber: quilt.serialNumber || '',
              icrCycle: '',
              status: '',
              returned: quilt.totalReturned || 0,
              cleaned: quilt.totalCleaned || 0,
              repaired: quilt.totalRepaired || 0,
              retired: quilt.totalRetired || 0,
              repairTypes: this.toRepairTypesText(quilt.repairTypeAggregates) || '-'
            });
            return;
          }

          cycles.forEach((cycle: any) => {
            rows.push({
              locationName: loc.locationName || '',
              partNumber: part.partNumber || '',
              serialNumber: quilt.serialNumber || '',
              icrCycle: cycle.icrCycle || '',
              status: cycle.status || '',
              returned: cycle.returned || 0,
              cleaned: cycle.cleaned || 0,
              repaired: cycle.repaired || 0,
              retired: cycle.retired || 0,
              repairTypes: this.toRepairTypesText(cycle.repairTypeAggregates) || '-'
            });
          });
        });
      });
    });

    this.printRows = rows;
  }

  formatIcrCycle(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return `ICR Cycle #${value}`;
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
