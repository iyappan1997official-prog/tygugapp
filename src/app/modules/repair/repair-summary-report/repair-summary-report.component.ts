/*import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { ActivatedRoute } from '@angular/router';
import { RepairService } from 'src/app/modules/repair/repair.service';

@Component({
  selector: 'app-repair-summary-report',
  templateUrl: './repair-summary-report.component.html',
  styleUrls: ['./repair-summary-report.component.scss']
})
export class RepairSummaryReportComponent implements OnInit {
  isLoading = false;
  repairForm: FormGroup;
  summaryData: any = {};
  reportData: any[] = [];
  originalReportData: any[] = [];
  expandedLocationIndex: number | null = null;
  expandedParts: { [key: string]: boolean } = {};
  allLocations: { id: number; name: string }[] = [];

  allQuiltStatus = [
    { id: 1, name: 'Cleaned' },
    { id: 2, name: 'Retired' },
    { id: 3, name: 'Repaired' },
  ];

  totalItems = 0;
  currentPage = 0;
  pageSize = 10;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private repairService: RepairService
  ) {
    this.repairForm = this.fb.group({
      locationId: ['0'],
      quiltStatusId: ['0'],
      startDate: [''],
      endDate: [''],
      customerId: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['startDate'] && params['endDate']) {
        this.repairForm.patchValue({
          customerId: params['customerId'] || '',
          startDate: params['startDate'],
          endDate: params['endDate']
        });
      } else {
        this.toastr.error('Date range is missing. Please generate the report from the previous screen.');
      }
      this.loadReportDataFromAPI();
    });
  }


  loadReportDataFromAPI(): void {
    const formData = this.repairForm.value;
    if (!formData.startDate || !formData.endDate) {
      this.toastr.warning('Please select Start Date and End Date to load report');
      return;
    }

    this.isLoading = true;
    this.spinner.show();

    const payload = {
      searchBy: "",
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      customerGroupIds: [] as number[],
      sortByColumn: "",
      sortDescendingOrder: false,
      customerId: formData.customerId ? parseInt(formData.customerId) : 0,
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    this.repairService.getRepairSummaryReport(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.spinner.hide();

        if (!response.hasError && response.data) {
          this.processApiResponse(response.data);
        } else {
          this.toastr.error(response.message || 'Failed to load report data');
          console.error('API Error:', response.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.spinner.hide();
        this.toastr.error('Error fetching report data');
        console.error('API Call Error:', error);
      }
    });
  }

  processApiResponse(apiData: any): void {
    this.summaryData = {
      cleanedCount: apiData.results?.grandTotalCleaned || 0,
      repairedCount: apiData.results?.grandTotalRepaired || 0,
      retiredCount: apiData.results?.grandTotalRetired || 0,
      totalReturned: apiData.results?.grandTotalReturned || 0
    };

    const mappedData = (apiData.results?.reportDetails || []).map((location: any) => ({
      locationName: location.locationName,
      cleanedCount: location.cleanedTotal || 0,
      repairedCount: location.repairedTotal || 0,
      retiredCount: location.retiredTotal || 0,
      totalReturned: location.totalReturned || 0,
      partNumbers: (location.quiltTypeDetails || []).map((quilt: any) => ({
        partNumber: quilt.partNumber,
        cleaningCount: quilt.cleanedTotal || 0,
        repairedCount: quilt.repairedTotal || 0,
        retiredCount: quilt.retiredTotal || 0,
        total: quilt.totalReturned || 0,
        repairDetails: quilt.aggregatedRepairTypes || [],
        retiredDetails: quilt.aggregatedDisposalReasons || []
      }))
    }));

    this.originalReportData = [...mappedData];
    this.reportData = [...mappedData];
    this.totalItems = apiData.totalCount || this.reportData.length;

    function isString(value: any): value is string {
      return typeof value === 'string' && value.trim() !== '';
    }

    const uniqueLocations: string[] = Array.from(
      new Set(
        (apiData.results?.reportDetails || [])
          .map((x: any) => x?.locationName)
          .filter(isString)
      )
    );

    this.allLocations = uniqueLocations.map((name: string, index: number) => ({ id: index + 1, name }));
  }

  searchReport(): void {
    const formData = this.repairForm.value;
    if (formData.locationId !== '0') {
      const selectedLocation = this.allLocations.find(loc => loc.id == formData.locationId)?.name;
      this.reportData = this.originalReportData.filter(loc => loc.locationName === selectedLocation);
    } else {
      this.reportData = [...this.originalReportData];
    }
  }

  resetReport(): void {
    this.repairForm.reset({ locationId: '0', quiltStatusId: '0', dateRange: 'thisYear' });
    this.reportData = [...this.originalReportData];
    this.summaryData = { cleanedCount: 0, repairedCount: 0, retiredCount: 0, totalReturned: 0 };
    this.totalItems = this.reportData.length;
  }

  toggleLocationDetails(index: number): void {
    this.expandedLocationIndex = this.expandedLocationIndex === index ? null : index;
  }

  togglePartDetails(locationIndex: number, partIndex: number): void {
    const key = `${locationIndex}-${partIndex}`;
    this.expandedParts[key] = !this.expandedParts[key];
  }

  isPartExpanded(locationIndex: number, partIndex: number): boolean {
    return this.expandedParts[`${locationIndex}-${partIndex}`] === true;
  }

  // ✅ Export based on FULL original data to maintain all hierarchy
  exportReport(): void {
    const dataToExport = this.originalReportData; // use full dataset

    if (!dataToExport.length) {
      this.toastr.warning('No data available to export');
      return;
    }

    const exportRows: any[] = [];
    dataToExport.forEach((loc: any) => {
      const locationLevel = {
        locationName: loc.locationName || '',
        cleanedCount: loc.cleanedCount || 0,
        repairedCount: loc.repairedCount || 0,
        retiredCount: loc.retiredCount || 0,
        totalReturned: loc.totalReturned || 0
      };
      const parts = loc.partNumbers || [];
      if (!parts.length) {
        exportRows.push({
          'Location Name': locationLevel.locationName,
          'Cleaned': locationLevel.cleanedCount,
          'Repaired': locationLevel.repairedCount,
          'Retired': locationLevel.retiredCount,
          'Total': locationLevel.totalReturned,
          'Part Number': '',
          'Cleaning': '',
          'Repaired (Part)': '',
          'Retired (Part)': '',
          'Total (Part)': '',
          'RepairDetails': '',
          'RetiredDetails': ''
        });
      } else {
        parts.forEach((p: any) => {
          exportRows.push({
            'Location Name': locationLevel.locationName,
            'Cleaned': locationLevel.cleanedCount,
            'Repaired': locationLevel.repairedCount,
            'Retired': locationLevel.retiredCount,
            'Total': locationLevel.totalReturned,
            'Part Number': p.partNumber || '',
            'Cleaning': p.cleaningCount || 0,
            'Repaired (Part)': p.repairedCount || 0,
            'Retired (Part)': p.retiredCount || 0,
            'Total (Part)': p.total || 0,
            'RepairDetails': (p.repairDetails || []).join(', '),
            'RetiredDetails': (p.retiredDetails || []).join(', ')
          });
        });
      }
    });

    const headers = [
      'Location Name', 'Cleaned', 'Repaired', 'Retired', 'Total',
      'Part Number', 'Cleaning', 'Repaired (Part)', 'Retired (Part)', 'Total (Part)',
      'RepairDetails', 'RetiredDetails'
    ];

    const worksheet = XLSX.utils.json_to_sheet(exportRows, { header: headers });
    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (worksheet[cellAddress]) worksheet[cellAddress].s = { font: { bold: true } };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Repair Summary');
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `RepairSummaryReport_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
    this.toastr.success('Report exported successfully');
  }

  onPageChange(event: PageEvent): void {
    this.currentPage =
      this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReportDataFromAPI();
  }
}
*/


/*import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { ActivatedRoute } from '@angular/router';
import { RepairService } from 'src/app/modules/repair/repair.service';

@Component({
  selector: 'app-repair-summary-report',
  templateUrl: './repair-summary-report.component.html',
  styleUrls: ['./repair-summary-report.component.scss']
})
export class RepairSummaryReportComponent implements OnInit {
  isLoading = false;
  repairForm: FormGroup;
  summaryData: any = {};
  reportData: any[] = [];
  originalReportData: any[] = [];
  expandedLocationIndex: number | null = null;
  expandedParts: { [key: string]: boolean } = {};

  allLocations: { id: number; name: string }[] = [];
  length: number = 0;            // paginator total items
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  pageEvent: PageEvent;

  allQuiltStatus = [
    { id: 1, name: 'Cleaned' },
    { id: 2, name: 'Retired' },
    { id: 3, name: 'Repaired' },
  ];
  reportType: 'SUMMARY' | 'QUILTS' = 'SUMMARY';

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private repairService: RepairService
  ) {
    this.repairForm = this.fb.group({
      locationId: ['0'],
      locationName: [''],
      quiltStatusId: ['0'],
      startDate: [''],
      endDate: [''],
      customerId: [''],  // optional field
      pageNumber: 1,
      pageSize: this.pageSize,
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.reportType = (params['reportType'] as 'SUMMARY' | 'QUILTS') || 'SUMMARY';
      if (params['startDate'] && params['endDate']) {
        this.repairForm.patchValue({
          customerId: params['customerId'] || '',
          startDate: params['startDate'],
          endDate: params['endDate'],
          pageNumber: 1,
          pageSize: 10
        });
      } else {
        //this.toastr.error('Date range is missing. Please generate the report from the previous screen.')
          this.resetUIForNewReportType(); // 
      }
      this.loadReportDataFromAPI();
    });
  }

  resetUIForNewReportType(): void {
    this.reportData = [];
    this.originalReportData = [];
    this.summaryData = {
      cleanedCount: 0,
      repairedCount: 0,
      retiredCount: 0,
      totalReturned: 0
    };
    this.length = 0;
    this.expandedLocationIndex = null;
    this.expandedParts = {};
  }

  // Server-side API call
  loadReportDataFromAPI(): void {
    const formData = this.repairForm.value;

    if (!formData.startDate || !formData.endDate) {
      this.toastr.warning('Please select Start Date and End Date to load report');
      return;
    }

    this.isLoading = true;
    this.spinner.show();

    const payload = {
      searchBy: "",
      pageNumber: formData.pageNumber || 1,
      pageSize: formData.pageSize || 10,
      customerGroupIds: [] as number[],
      sortByColumn: "",
      sortDescendingOrder: false,
      customerId: formData.customerId ? parseInt(formData.customerId) : 0,
      locationName: formData.locationName || '',
      quiltStatusId: formData.quiltStatusId || 0,
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    const apiCall =
      this.reportType === 'QUILTS'
        ? this.repairService.repairSummaryWithQuilts(payload)
        : this.repairService.getRepairSummaryReport(payload);

    apiCall.subscribe({
      next: (response) => {
        this.isLoading = false;
        this.spinner.hide();

        if (!response.hasError && response.data) {
          this.processApiResponse(response.data);
        } else {
          this.toastr.error(response.message || 'Failed to load report data');
          console.error('API Error:', response.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.spinner.hide();
        this.toastr.error('Error fetching report data');
        console.error('API Call Error:', error);
      }
    });
  }

  processApiResponse(apiData: any): void {
    this.summaryData = {
      cleanedCount: apiData.results?.grandTotalCleaned || 0,
      repairedCount: apiData.results?.grandTotalRepaired || 0,
      retiredCount: apiData.results?.grandTotalRetired || 0,
      totalReturned: apiData.results?.grandTotalReturned || 0
    };

    const mappedData = (apiData.results?.reportDetails || []).map((location: any) => ({
      locationName: location.locationName,
      cleanedCount: location.cleanedTotal || 0,
      repairedCount: location.repairedTotal || 0,
      retiredCount: location.retiredTotal || 0,
      totalReturned: location.totalReturned || 0,
      partNumbers: (location.quiltTypeDetails || []).map((quilt: any) => ({
        partNumber: quilt.partNumber,
        cleaningCount: quilt.cleanedTotal || 0,
        repairedCount: quilt.repairedTotal || 0,
        retiredCount: quilt.retiredTotal || 0,
        total: quilt.totalReturned || 0,
        repairDetails: quilt.aggregatedRepairTypes || [],
        retiredDetails: quilt.aggregatedDisposalReasons || []
      }))
    }));

    this.originalReportData = [...mappedData];
    this.reportData = [...mappedData];

    // Paginator count = number of parent locations only
    this.length = apiData.results?.reportDetails?.length || 0;

    // Extract unique location names for dropdown
    const uniqueLocations: string[] = Array.from(
      new Set(
        (apiData.results?.reportDetails || [])
          .map((x: any) => x?.locationName)
          .filter((x: unknown): x is string => typeof x === 'string' && x.trim() !== '')
      )
    );
    this.allLocations = uniqueLocations.map((name: string, index: number) => ({ id: index + 1, name }));
  }

  searchReport(): void {
    const formData = this.repairForm.value;

    // Reset paginator to first page
    this.repairForm.patchValue({ pageNumber: 1 });

    if (formData.locationId !== '0') {
      const selectedLocation = this.allLocations.find(loc => loc.id == formData.locationId)?.name;
      if (selectedLocation) {
        this.reportData = this.originalReportData.filter(loc => loc.locationName === selectedLocation);
      } else {
        this.reportData = [...this.originalReportData];
      }
    } else {
      this.reportData = [...this.originalReportData];
    }

    // Update paginator total count for filtered data
    this.length = this.reportData.length;
  }

  resetReport(): void {
    this.repairForm.patchValue({ locationId: '0', quiltStatusId: '0' });
    this.reportData = [...this.originalReportData];
    this.summaryData = { cleanedCount: 0, repairedCount: 0, retiredCount: 0, totalReturned: 0 };

    // Reset paginator total count
    this.length = this.originalReportData.length;
  }

  toggleLocationDetails(index: number): void {
    this.expandedLocationIndex = this.expandedLocationIndex === index ? null : index;
  }

  togglePartDetails(locationIndex: number, partIndex: number): void {
    const key = `${locationIndex}-${partIndex}`;
    this.expandedParts[key] = !this.expandedParts[key];
  }

  isPartExpanded(locationIndex: number, partIndex: number): boolean {
    return this.expandedParts[`${locationIndex}-${partIndex}`] === true;
  }

  exportReport(): void {
    const dataToExport = this.originalReportData;
    if (!dataToExport.length) {
      this.toastr.warning('No data available to export');
      return;
    }

    const exportRows: any[] = [];
    dataToExport.forEach((loc: any) => {
      const locationLevel = {
        locationName: loc.locationName || '',
        cleanedCount: loc.cleanedCount || 0,
        repairedCount: loc.repairedCount || 0,
        retiredCount: loc.retiredCount || 0,
        totalReturned: loc.totalReturned || 0
      };
      const parts = loc.partNumbers || [];
      if (!parts.length) {
        exportRows.push({
          'Location Name': locationLevel.locationName,
          'Cleaned': locationLevel.cleanedCount,
          'Repaired': locationLevel.repairedCount,
          'Retired': locationLevel.retiredCount,
          'Total': locationLevel.totalReturned,
          'Part Number': '',
          'Cleaning': '',
          'Repaired (Part)': '',
          'Retired (Part)': '',
          'Total (Part)': '',
          'RepairDetails': '',
          'RetiredDetails': ''
        });
      } else {
        parts.forEach((p: any) => {
          exportRows.push({
            'Location Name': locationLevel.locationName,
            'Cleaned': locationLevel.cleanedCount,
            'Repaired': locationLevel.repairedCount,
            'Retired': locationLevel.retiredCount,
            'Total': locationLevel.totalReturned,
            'Part Number': p.partNumber || '',
            'Cleaning': p.cleaningCount || 0,
            'Repaired (Part)': p.repairedCount || 0,
            'Retired (Part)': p.retiredCount || 0,
            'Total (Part)': p.total || 0,
            'RepairDetails': (p.repairDetails || []).join(', '),
            'RetiredDetails': (p.retiredDetails || []).join(', ')
          });
        });
      }
    });

    const headers = [
      'Location Name', 'Cleaned', 'Repaired', 'Retired', 'Total',
      'Part Number', 'Cleaning', 'Repaired (Part)', 'Retired (Part)', 'Total (Part)',
      'RepairDetails', 'RetiredDetails'
    ];

    const worksheet = XLSX.utils.json_to_sheet(exportRows, { header: headers });
    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (worksheet[cellAddress]) worksheet[cellAddress].s = { font: { bold: true } };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Repair Summary');
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `RepairSummaryReport_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
    this.toastr.success('Report exported successfully');
  }

  //Paginator function
  paginator(event: any) {
    const { pageSize, pageNumber } = this.repairForm.controls;
    pageSize.patchValue(event.pageSize);
    pageNumber.patchValue(event.pageIndex + 1);

    this.loadReportDataFromAPI();
  }
}
*/
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { ActivatedRoute } from '@angular/router';
import { RepairService } from 'src/app/modules/repair/repair.service';

@Component({
  selector: 'app-repair-summary-report',
  templateUrl: './repair-summary-report.component.html',
  styleUrls: ['./repair-summary-report.component.scss']
})
export class RepairSummaryReportComponent implements OnInit {
  isLoading = false;
  repairForm: FormGroup;
  summaryData: any = {};
  reportData: any[] = [];
  originalReportData: any[] = [];
  expandedLocationIndex: number | null = null;
  expandedParts: { [key: string]: boolean } = {};
  expandedQuilts: { [key: string]: boolean } = {};
  allLocations: { id: number; name: string }[] = [];
  length: number = 0;            // paginator total items
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  pageEvent: PageEvent;
  pagedReportData: any[] = [];
  filteredReportData: any[] = [];
  dateRangeDisplay: string = '';


  allQuiltStatus = [
    { id: 1, name: 'Cleaned' },
    { id: 2, name: 'Retired' },
    { id: 3, name: 'Repaired' },
  ];

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private repairService: RepairService
  ) {
    this.repairForm = this.fb.group({
      locationId: ['0'],
      locationName: [''],
      quiltStatusId: ['0'],
      startDate: [''],
      endDate: [''],
      customerId: [''],  // optional field
      pageNumber: 1,
      pageSize: this.pageSize,
    });
  }

  /*ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['startDate'] && params['endDate']) {
        this.repairForm.patchValue({
          customerId: params['customerId'] || '',
          startDate: params['startDate'],
          endDate: params['endDate'],
          pageNumber: 1,
          pageSize: 10
        });
      } else {
        //this.toastr.error('Date range is missing. Please generate the report from the previous screen.');
      }
      this.loadReportDataFromAPI();
    });
  } */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      if (params['startDate'] && params['endDate']) {

        this.repairForm.patchValue({
          customerId: params['customerId'] || '',
          startDate: params['startDate'],
          endDate: params['endDate'],
          pageNumber: 1,
          pageSize: 10
        });

        // ✅ FORMAT DATE RANGE 
        const start = moment(params['startDate']).format('MM/DD/YYYY');
        const end = moment(params['endDate']).format('MM/DD/YYYY');
        // ✅ FINAL STRING
        this.dateRangeDisplay = `Date Range: ${start} – ${end}`;

      }

      this.loadReportDataFromAPI();
    });
  }
  loadReportDataFromAPI(): void {
    const formData = this.repairForm.value;

    if (!formData.startDate || !formData.endDate) {
      this.toastr.warning('Please select Start Date and End Date');
      return;
    }

    this.isLoading = true;
    this.spinner.show();

    const payload = {
      searchBy: '',
      pageNumber: formData.pageNumber || 1,
      pageSize: formData.pageSize || 10,

      // ✅ FIXED: explicit type
      customerGroupIds: [] as number[],

      sortByColumn: '',
      sortDescendingOrder: false,
      customerId: formData.customerId ? Number(formData.customerId) : 0,
      locationName: '',
      quiltStatusId: Number(formData.quiltStatusId || 0),
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    this.repairService.repairSummaryWithQuilts(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.spinner.hide();

        if (response && response.locations) {
          this.processApiResponse(response);
        } else {
          this.toastr.error('Invalid response format');
          console.error(response);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.spinner.hide();
        this.toastr.error('Failed to load report data');
        console.error(error);
      }
    });
  }


  /*
  // Server-side API call
  loadReportDataFromAPI(): void {
    const formData = this.repairForm.value;

    if (!formData.startDate || !formData.endDate) {
      this.toastr.warning('Please select Start Date and End Date to load report');
      return;
    }

    this.isLoading = true;
    this.spinner.show();

    const payload = {
      searchBy: "",
      pageNumber: formData.pageNumber || 1,
      pageSize: formData.pageSize || 10,
      customerGroupIds: [] as number[],
      sortByColumn: "",
      sortDescendingOrder: false,
      customerId: formData.customerId ? parseInt(formData.customerId) : 0,
      locationName: formData.locationName || '',
      quiltStatusId: formData.quiltStatusId || 0,
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    this.repairService.repairSummaryWithQuilts(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.spinner.hide();

        if (!response.hasError && response.data) {
          this.processApiResponse(response.data);
        } else {
          this.toastr.error(response.message || 'Failed to load report data');
          console.error('API Error:', response.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.spinner.hide();
        this.toastr.error('Error fetching report data');
        console.error('API Call Error:', error);
      }
    });
  }
  */
  /*processApiResponse(apiData: any): void {
    this.summaryData = {
      cleanedCount: apiData.results?.grandTotalCleaned || 0,
      repairedCount: apiData.results?.grandTotalRepaired || 0,
      retiredCount: apiData.results?.grandTotalRetired || 0,
      totalReturned: apiData.results?.grandTotalReturned || 0
    };

    const mappedData = (apiData.results?.reportDetails || []).map((location: any) => ({
      locationName: location.locationName,
      cleanedCount: location.cleanedTotal || 0,
      repairedCount: location.repairedTotal || 0,
      retiredCount: location.retiredTotal || 0,
      totalReturned: location.totalReturned || 0,
      partNumbers: (location.quiltTypeDetails || []).map((quilt: any) => ({
        partNumber: quilt.partNumber,
        cleaningCount: quilt.cleanedTotal || 0,
        repairedCount: quilt.repairedTotal || 0,
        retiredCount: quilt.retiredTotal || 0,
        total: quilt.totalReturned || 0,
        repairDetails: quilt.aggregatedRepairTypes || [],
        retiredDetails: quilt.aggregatedDisposalReasons || []
      }))
    }));

    this.originalReportData = [...mappedData];
    this.reportData = [...mappedData];

    // Paginator count = number of parent locations only
    this.length = apiData.results?.reportDetails?.length || 0;

    // Extract unique location names for dropdown
    const uniqueLocations: string[] = Array.from(
      new Set(
        (apiData.results?.reportDetails || [])
          .map((x: any) => x?.locationName)
          .filter((x: unknown): x is string => typeof x === 'string' && x.trim() !== '')
      )
    );
    this.allLocations = uniqueLocations.map((name: string, index: number) => ({ id: index + 1, name }));
  }*/

  processApiResponse(apiData: any): void {

    /* -----------------------------
     * 1. Summary data (matches old logic)
     * ----------------------------- */
    this.summaryData = {
      cleanedCount: apiData?.summary?.cleaned
        ?? apiData?.grandTotals?.cleaned
        ?? 0,

      repairedCount: apiData?.summary?.repaired
        ?? apiData?.grandTotals?.repaired
        ?? 0,

      retiredCount: apiData?.summary?.retired
        ?? apiData?.grandTotals?.retired
        ?? 0,

      totalReturned: apiData?.summary?.returned
        ?? apiData?.grandTotals?.returned
        ?? 0
    };

    /* -----------------------------
     * 2. Main mapping (Location → Part → Quilt)
     * ----------------------------- */
    const mappedData = (apiData.locations || []).map((location: any) => ({
      locationName: location.locationName,

      // location-level totals
      cleanedCount: location.cleaned || 0,
      repairedCount: location.repaired || 0,
      retiredCount: location.retired || 0,
      totalReturned: location.returned || 0,

      // part-level
      partNumbers: (location.parts || []).map((part: any) => ({
        partNumber: part.partNumber,

        cleaningCount: part.cleaned || 0,
        repairedCount: part.repaired || 0,
        retiredCount: part.retired || 0,
        total: part.returned || 0,

        // NEW: quilt-level drill down
        quilts: (part.quilts || []).map((q: any) => ({
          quiltId: q.quiltId,
          serialNumber: q.serialNumber,
          receiveDate: q.receiveDate,

          returned: q.returned || 0,
          cleaned: q.cleaned || 0,
          repaired: q.repaired || 0,
          retired: q.retired || 0,

          // NEW fields (no aggregation – true source)
          repairTypes: q.repairTypes || 'None',
          retiredTypes: q.retiredTypes || 'None'
        }))
      }))
    }));

    /* -----------------------------
     * 3. Preserve original bindings
     * ----------------------------- */
    this.originalReportData = [...mappedData];
    //this.reportData = [...mappedData];
    this.filteredReportData = [...mappedData];

    /* -----------------------------
     * 4. Paginator (location-level only)
     * ----------------------------- */
    this.length = mappedData.length;
    this.applyPagination();

    /* -----------------------------
     * 5. Location dropdown (unchanged logic)
     * ----------------------------- */
    const uniqueLocations: string[] = Array.from(
      new Set(
        (apiData.locations || [])
          .map((x: any) => x?.locationName)
          .filter((x: any) => typeof x === 'string' && x.trim() !== '')
      )
    );

    this.allLocations = uniqueLocations.map((name, index) => ({
      id: index + 1,
      name
    }));
  }

  applyPagination(): void {
    const formData = this.repairForm.value;

    const pageNumber = formData.pageNumber || 1;
    const pageSize = formData.pageSize || this.pageSize;

    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    this.reportData = this.filteredReportData.slice(startIndex, endIndex);

    // 👇 ONLY slice LOCATION LEVEL
    //this.pagedReportData = this.originalReportData.slice(startIndex, endIndex);

    // UI should bind to pagedReportData
    //this.reportData = [...this.pagedReportData];
  }

  /*searchReport(): void {
    const formData = this.repairForm.value;

    // Reset paginator to first page
    this.repairForm.patchValue({ pageNumber: 1 });

    if (formData.locationId !== '0') {
      const selectedLocation = this.allLocations.find(loc => loc.id == formData.locationId)?.name;
      if (selectedLocation) {
        this.reportData = this.originalReportData.filter(loc => loc.locationName === selectedLocation);
      } else {
        this.reportData = [...this.originalReportData];
      }
    } else {
      this.reportData = [...this.originalReportData];
    }

    // Update paginator total count for filtered data
    this.length = this.reportData.length;
    this.originalReportData = [...this.reportData];   
    this.applyPagination();
  }*/


  searchReport(): void {
    const formData = this.repairForm.value;

    this.repairForm.patchValue({ pageNumber: 1 });

    if (formData.locationId !== '0') {
      const selectedLocation = this.allLocations.find(
        loc => loc.id == formData.locationId
      )?.name;

      if (selectedLocation) {
        this.filteredReportData = this.originalReportData.filter(
          loc => loc.locationName === selectedLocation
        );
      } else {
        this.filteredReportData = [...this.originalReportData];
      }
    } else {
      this.filteredReportData = [...this.originalReportData];
    }

    this.length = this.filteredReportData.length;
    this.applyPagination();
  }

  /*resetReport(): void {
    this.repairForm.patchValue({ locationId: '0', quiltStatusId: '0' });
    this.reportData = [...this.originalReportData];
    this.summaryData = { cleanedCount: 0, repairedCount: 0, retiredCount: 0, totalReturned: 0 };

    // Reset paginator total count
    this.length = this.originalReportData.length;
    this.repairForm.patchValue({ pageNumber: 1 });
    this.applyPagination();
  }*/

  resetReport(): void {
    this.repairForm.patchValue({ locationId: '0', quiltStatusId: '0', pageNumber: 1 });

    this.filteredReportData = [...this.originalReportData];
    this.summaryData = { cleanedCount: 0, repairedCount: 0, retiredCount: 0, totalReturned: 0 };

    this.length = this.filteredReportData.length;
    this.applyPagination();
  }


  toggleLocationDetails(index: number): void {
    this.expandedLocationIndex = this.expandedLocationIndex === index ? null : index;
  }

  togglePartDetails(locationIndex: number, partIndex: number): void {
    const key = `${locationIndex}-${partIndex}`;
    this.expandedParts[key] = !this.expandedParts[key];
  }

  isPartExpanded(locationIndex: number, partIndex: number): boolean {
    return this.expandedParts[`${locationIndex}-${partIndex}`] === true;
  }

  toggleQuiltDetails(locIdx: number, partIdx: number, quiltIdx: number): void {
    const key = `${locIdx}-${partIdx}-${quiltIdx}`;
    this.expandedQuilts[key] = !this.expandedQuilts[key];
  }

  isQuiltExpanded(locIdx: number, partIdx: number, quiltIdx: number): boolean {
    return this.expandedQuilts[`${locIdx}-${partIdx}-${quiltIdx}`] === true;
  }

  exportReport(): void {
    const dataToExport = this.originalReportData;
    if (!dataToExport || !dataToExport.length) {
      this.toastr.warning('No data available to export');
      return;
    }

    const exportRows: any[] = [];

    dataToExport.forEach((loc: any) => {

      /* ===== 1️⃣ LOCATION LEVEL ROW ===== */
      exportRows.push({
        'Location Name': loc.locationName || '',
        'Part Number': '',
        'Quilt Serial Number': '',
        'Cleaned': loc.cleanedCount || 0,
        'Repaired': loc.repairedCount || 0,
        'Retired': loc.retiredCount || 0,
        'Total': loc.totalReturned || 0,
        'Repair Summary': '',
        'Retire Summary': ''
      });

      const parts = loc.partNumbers || [];

      parts.forEach((p: any) => {

        /* ===== 2️⃣ PART LEVEL ROW ===== */
        exportRows.push({
          'Location Name': '',
          'Part Number': p.partNumber || '',
          'Quilt Serial Number': '',
          'Cleaned': p.cleaningCount || 0,
          'Repaired': p.repairedCount || 0,
          'Retired': p.retiredCount || 0,
          'Total': p.total || 0,
          'Repair Summary': '',
          'Retire Summary': ''
        });

        const quilts = p.quilts || [];

        quilts.forEach((q: any) => {

          /* ===== 3️⃣ QUILT LEVEL ROW ===== */
          exportRows.push({
            'Location Name': '',
            'Part Number': '',
            'Quilt Serial Number': q.serialNumber || '',
            'Cleaned': q.cleaned || 0,        
            'Repaired': q.repaired || 0,      
            'Retired': q.retired || 0,        
            'Total': q.returned || 0,         
            'Repair Summary': q.repairTypes || 'None',   
            'Retire Summary': q.retiredTypes || 'None'   
          });

        });
      });
    });

    const headers = [
      'Location Name',
      'Part Number',
      'Quilt Serial Number',
      'Cleaned',
      'Repaired',
      'Retired',
      'Total',
      'Repair Summary',
      'Retire Summary'
    ];

    const worksheet = XLSX.utils.json_to_sheet(exportRows, { header: headers });

    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { font: { bold: true } };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Repair Summary');

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream'
    });

    saveAs(blob, `RepairSummaryReport_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
    this.toastr.success('Report exported successfully');
  }


  // Paginator function
  paginator(event: PageEvent): void {
    this.repairForm.patchValue({
      pageNumber: event.pageIndex + 1,
      pageSize: event.pageSize
    });
    this.applyPagination();
  }
}
