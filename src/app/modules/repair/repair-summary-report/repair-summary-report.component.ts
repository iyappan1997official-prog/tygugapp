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
  selectedExportType: 'hierarchical' | 'raw' | '' = '';


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
      const startDateParam = params['startDate'] || params['startReceiveDate'];
      const endDateParam = params['endDate'] || params['endReceiveDate'];
      const customerIdParam = params['customerId'] || '';

      if (startDateParam && endDateParam) {
        this.repairForm.patchValue({
          customerId: customerIdParam,
          startDate: startDateParam,
          endDate: endDateParam,
          pageNumber: 1,
          pageSize: 10
        });

        const start = moment(startDateParam).format('MM/DD/YYYY');
        const end = moment(endDateParam).format('MM/DD/YYYY');
        this.dateRangeDisplay = `Date Range: ${start} - ${end}`;
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
      startReceiveDate: formData.startDate,
      endReceiveDate: formData.endDate,
      locationId: 0,
      customerId: formData.customerId ? Number(formData.customerId) : 0
    };

    this.repairService.repairSummaryWithQuilts(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.spinner.hide();

        if (response?.data?.locations || response?.locations) {
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
    const report = apiData?.data ?? apiData ?? {};

    this.summaryData = {
      totalQuilts: report?.totalQuilts ?? report?.totalquilts ?? report?.TotalQuilts ?? report?.Totalquilts ?? 0,
      cleanedCount: report?.totalCleaned ?? report?.totalcleaned ?? report?.TotalCleaned ?? report?.summary?.cleaned ?? report?.grandTotals?.cleaned ?? 0,
      repairedCount: report?.totalRepaired ?? report?.totalrepaired ?? report?.TotalRepaired ?? report?.summary?.repaired ?? report?.grandTotals?.repaired ?? 0,
      retiredCount: report?.totalRetired ?? report?.totalretired ?? report?.TotalRetired ?? report?.summary?.retired ?? report?.grandTotals?.retired ?? 0,
      totalReturned: report?.totalReturned ?? report?.totalreturned ?? report?.TotalReturned ?? report?.summary?.returned ?? report?.grandTotals?.returned ?? 0
    };

    const mappedData = (report.locations || []).map((location: any) => ({
      locationName: location.locationName,
      cleanedCount: location.totalCleaned ?? location.cleaned ?? 0,
      repairedCount: location.totalRepaired ?? location.repaired ?? 0,
      retiredCount: location.totalRetired ?? location.retired ?? 0,
      totalReturned: location.totalReturned ?? location.returned ?? 0,
      partNumbers: (location.partNumbers || location.parts || []).map((part: any) => ({
        partNumber: part.partNumber,
        cleaningCount: part.totalCleaned ?? part.cleaned ?? 0,
        repairedCount: part.totalRepaired ?? part.repaired ?? 0,
        retiredCount: part.totalRetired ?? part.retired ?? 0,
        total: part.totalReturned ?? part.returned ?? 0,
        quilts: (part.quilts || []).map((q: any) => ({
          quiltId: q.quiltId,
          serialNumber: q.serialNumber,
          receiveDate: q.receiveDate || null,
          returned: q.totalReturned ?? q.returned ?? 0,
          cleaned: q.totalCleaned ?? q.cleaned ?? 0,
          repaired: q.totalRepaired ?? q.repaired ?? 0,
          retired: q.totalRetired ?? q.retired ?? 0,
          repairTypes: this.toAggregateText(q.repairTypeAggregates || q.aggregatedRepairTypes || q.repairTypes),
          retiredTypes: this.toAggregateText(q.retiredTypeAggregates || q.aggregatedDisposalReasons || q.retiredTypes),
          cycles: (q.cycles || []).map((cycle: any) => ({
            reportId: cycle.reportId || 0,
            icrCycle: cycle.icrCycle || 0,
            receiveDate: cycle.receiveDate || null,
            returned: cycle.returned || 0,
            cleaned: cycle.cleaned || 0,
            repaired: cycle.repaired || 0,
            retired: cycle.retired || 0,
            repairTypes: this.toAggregateText(cycle.repairTypeAggregates || cycle.repairTypes)
          }))
        }))
      }))
    }));

    this.originalReportData = [...mappedData];
    this.filteredReportData = [...mappedData];
    this.length = mappedData.length;
    this.applyPagination();

    const uniqueLocations: string[] = Array.from(
      new Set(
        (report.locations || [])
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
    this.summaryData = { totalQuilts: 0, cleanedCount: 0, repairedCount: 0, retiredCount: 0, totalReturned: 0 };

    // Reset paginator total count
    this.length = this.originalReportData.length;
    this.repairForm.patchValue({ pageNumber: 1 });
    this.applyPagination();
  }*/

  resetReport(): void {
    this.repairForm.patchValue({ locationId: '0', quiltStatusId: '0', pageNumber: 1 });

    this.filteredReportData = [...this.originalReportData];

    this.length = this.filteredReportData.length;
    this.applyPagination();
  }

  syncLatestData(): void {
    this.isLoading = true;
    this.spinner.show();

    this.repairService.syncCustomerCenterIcrCycleReport().subscribe({
      next: (res: any) => {
        const msg = res?.message || 'Sync completed successfully';
        this.toastr.success(msg);
        this.loadReportDataFromAPI();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.spinner.hide();
        this.toastr.error(err?.error?.message || 'Failed to sync latest data');
      }
    });
  }

  printReport(): void {
    if (!this.validateOutputTypeSelection('print')) {
      return;
    }

    const { headers, rows } = this.getOutputConfig();
    if (!rows.length) {
      this.toastr.warning('No data available to print');
      return;
    }

    const printableRows = rows
      .map((row: any) => `<tr>${headers.map((h) => `<td>${this.escapeHtml(String(row[h] ?? ''))}</td>`).join('')}</tr>`)
      .join('');

    const tableHtml = `
      <html><head><title>Repair Summary Print</title>
      <style>
      body { font-family: Arial, sans-serif; padding: 16px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #d1d5db; padding: 6px 8px; font-size: 12px; text-align: left; vertical-align: top; }
      th { background: #e5eef4; }
      </style></head><body>
      <h2>Repair Summary Report</h2>
      <table><thead><tr>${headers.map((h) => `<th>${this.escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${printableRows}</tbody></table>
      </body></html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.toastr.error('Unable to open print window');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(tableHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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

  formatIcrCycle(value: any): string {
    const cycleNumber = Number(value);
    if (!Number.isFinite(cycleNumber) || cycleNumber <= 0) {
      return '-';
    }
    return `ICR Cycle #${cycleNumber}`;
  }

  private toAggregateText(value: any): string {
    if (!value) {
      return '';
    }

    if (Array.isArray(value)) {
      if (!value.length) {
        return '';
      }

      return value
        .map((x: any) => {
          if (typeof x === 'string') {
            const text = x.trim();
            return /^(none|null|-)$/i.test(text) ? '' : text;
          }
          const type = x?.repairType || x?.retiredType || x?.name || x?.type || '';
          const count = x?.count ?? x?.totalCount ?? null;
          if (!type) {
            return '';
          }
          return count !== null && count !== undefined ? `${type} (${count})` : type;
        })
        .filter((x: string) => x && x.trim() !== '')
        .join(', ') || '';
    }

    if (typeof value === 'string') {
      const text = value.trim();
      if (!text || /^(none|null|-)$/i.test(text)) {
        return '';
      }
      return text;
    }

    return '';
  }

  exportReport(): void {
    if (!this.validateOutputTypeSelection('export')) {
      return;
    }

    const { headers, rows, sheetName } = this.getOutputConfig();
    if (!rows.length) {
      this.toastr.warning('No data available to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });

    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { font: { bold: true } };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

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

  private validateOutputTypeSelection(actionName: 'print' | 'export'): boolean {
    if (!this.selectedExportType) {
      this.toastr.warning(`Please select print type before ${actionName}`);
      return false;
    }
    return true;
  }

  private getOutputConfig(): { headers: string[]; rows: any[]; sheetName: string } {
    if (this.selectedExportType === 'raw') {
      return {
        sheetName: 'Repair Summary Flat',
        headers: [
          'Location',
          'Part Number',
          'Serial Number',
          'ICR Cycle',
          'Returned',
          'Cleaned',
          'Repaired',
          'Retired',
          'Repair Type Aggregates'
        ],
        rows: this.buildFlatRows()
      };
    }

    return {
      sheetName: 'Repair Summary Hierarchical',
      headers: [
        'Level',
        'Location',
        'Part Number',
        'Serial Number',
        'ICR Cycle',
        'Returned',
        'Cleaned',
        'Repaired',
        'Retired',
        'Repair Type Aggregates'
      ],
      rows: this.buildHierarchicalRows()
    };
  }

  private buildHierarchicalRows(): any[] {
    const rows: any[] = [];
    const data = this.originalReportData || [];

    data.forEach((loc: any) => {
      rows.push({
        'Level': 'Location',
        'Location': loc.locationName || '',
        'Part Number': '',
        'Serial Number': '',
        'ICR Cycle': '',
        'Returned': loc.totalReturned || 0,
        'Cleaned': loc.cleanedCount || 0,
        'Repaired': loc.repairedCount || 0,
        'Retired': loc.retiredCount || 0,
        'Repair Type Aggregates': ''
      });

      (loc.partNumbers || []).forEach((part: any) => {
        rows.push({
          'Level': 'Part',
          'Location': loc.locationName || '',
          'Part Number': part.partNumber || '',
          'Serial Number': '',
          'ICR Cycle': '',
          'Returned': part.total || 0,
          'Cleaned': part.cleaningCount || 0,
          'Repaired': part.repairedCount || 0,
          'Retired': part.retiredCount || 0,
          'Repair Type Aggregates': ''
        });

        (part.quilts || []).forEach((q: any) => {
          rows.push({
            'Level': 'Quilt',
            'Location': loc.locationName || '',
            'Part Number': part.partNumber || '',
            'Serial Number': q.serialNumber || '',
            'ICR Cycle': '',
            'Returned': q.returned || 0,
            'Cleaned': q.cleaned || 0,
            'Repaired': q.repaired || 0,
            'Retired': q.retired || 0,
            'Repair Type Aggregates': q.repairTypes || 'None'
          });

          (q.cycles || []).forEach((cycle: any) => {
            rows.push({
              'Level': 'ICR Cycle',
              'Location': loc.locationName || '',
              'Part Number': part.partNumber || '',
              'Serial Number': q.serialNumber || '',
              'ICR Cycle': this.formatIcrCycle(cycle.icrCycle),
              'Returned': cycle.returned || 0,
              'Cleaned': cycle.cleaned || 0,
              'Repaired': cycle.repaired || 0,
              'Retired': cycle.retired || 0,
              'Repair Type Aggregates': cycle.repairTypes || 'None'
            });
          });
        });
      });
    });

    return rows;
  }

  private buildFlatRows(): any[] {
    const rows: any[] = [];
    const data = this.originalReportData || [];

    data.forEach((loc: any) => {
      (loc.partNumbers || []).forEach((part: any) => {
        (part.quilts || []).forEach((q: any) => {
          const cycles = q.cycles || [];

          if (!cycles.length) {
            rows.push({
              'Location': loc.locationName || '',
              'Part Number': part.partNumber || '',
              'Serial Number': q.serialNumber || '',
              'ICR Cycle': '-',
              'Returned': q.returned || 0,
              'Cleaned': q.cleaned || 0,
              'Repaired': q.repaired || 0,
              'Retired': q.retired || 0,
              'Repair Type Aggregates': q.repairTypes || 'None'
            });
            return;
          }

          cycles.forEach((cycle: any) => {
            rows.push({
              'Location': loc.locationName || '',
              'Part Number': part.partNumber || '',
              'Serial Number': q.serialNumber || '',
              'ICR Cycle': this.formatIcrCycle(cycle.icrCycle),
              'Returned': cycle.returned || 0,
              'Cleaned': cycle.cleaned || 0,
              'Repaired': cycle.repaired || 0,
              'Retired': cycle.retired || 0,
              'Repair Type Aggregates': cycle.repairTypes || 'None'
            });
          });
        });
      });
    });

    return rows;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
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
