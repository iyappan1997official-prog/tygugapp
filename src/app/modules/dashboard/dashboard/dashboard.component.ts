import { Component, ViewChild, OnInit, ChangeDetectorRef, ViewEncapsulation, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApexAxisChartSeries, ApexDataLabels, ApexFill, ApexLegend, ApexMarkers, ApexPlotOptions, ApexStates, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from "ng-apexcharts";
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexTheme,
  ApexTitleSubtitle
} from "ng-apexcharts";
import { FilterByCompanyComponent } from './modal/filter-by-company/filter-by-company.component';
import { LocationDetailsComponent } from './modal/location-details/location-details.component';
import { DashboardService } from './dashboard.service';
import { InventoryService } from '../../inventory/inventory.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import * as moment from 'moment';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { FilterByLocationComponent } from './modal/filter-by-location/filter-by-location.component';
import { MatSort } from '@angular/material/sort';
import { Roles } from 'src/app/shared/roles/rolesVar';
import { DatePipe } from '@angular/common';
import { FetchCustomersService } from 'src/app/shared/services/fetch-customers.service';
import { MapLocationComponent } from './modal/map-location/map-location.component';
import { ChartModalComponent } from './modal/chart-modal/chart-modal.component';
import { FetchQuiltTypesService } from 'src/app/shared/services/fetch-quilt-types.service';
import { ThresholdLimitModalComponent } from './modal/threshold-limit-modal/threshold-limit-modal.component';
import { ReportsService } from '../../reports/reports.service';
import { PalletDetailsComponent } from './modal/pallet-details/pallet-details.component';
import { ScannerModalComponent } from '../../inventory/scanner-modal/scanner-modal.component';


enum Tabs {
  "leased" = 0,
  "purchased" = 1,
  "consigned" = 2
}

enum Tabs1 {
  "consigned" = 0,
  "purchased" = 1
}

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  theme: ApexTheme;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  marker: ApexMarkers;
  plotOptions: ApexPlotOptions;
  tooltip: ApexStates;
};

export type ChartOptions1 = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  labels: string[];
  legend: ApexLegend;
  subtitle: ApexTitleSubtitle;
};

export interface Element {
  location: string;
  quilttype: number;
  onhand: number;
  inbound: string;
  outbound: string;
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  // encapsulation: ViewEncapsulation.None
})




export class DashboardComponent implements OnInit {
  displayedColumns: string[] = ['location', 'quilttype', 'onhand', 'inbound', 'outbound'];
  collapsed: any = false;
  collapsedNot: number;
  cardClicked: number;
  logStatus: boolean = this.activatedRoute?.snapshot?.queryParams?.logStatus;
  @ViewChild(MatSort) sort: MatSort;
  // @Input() customerId: number[] =[];
  abc: any = "abc";
  public roleEnum = Roles;
  dates = [
    { value: 'monthly', viewValue: 'Monthly' },
    { value: 'weekly', viewValue: 'Weekly' },
    { value: 'quarterly', viewValue: 'Quarterly' },
    { value: 'yearly', viewValue: 'Yearly' },
    { value: 'custom', viewValue: 'Custom' }
  ];
  selectedOption = 'on Hand';
  selectedRange = 'monthly';
  chartOpt = [
    { value: 'on Hand', viewValue: 'On Hand' },
    { value: 'inbound', viewValue: 'Inbound' },
    { value: 'outbound', viewValue: 'Outbound' }
  ];
  today = new Date();
  chartForm: FormGroup;
  rangeForm: FormGroup;
  regionSelected: FormGroup;
  consignDrop: FormGroup;
  dateGroup: FormGroup
  companyDrop: FormGroup;
  donutChart: FormGroup;
  usedChart: FormGroup;
  usageSize: FormGroup;
  totalUsage: FormGroup;
  isCollapsed: boolean = true;
  isCollapsed1: boolean = true;
  quiltData: any = {};
  usedDataChart: any = {}
  usageSizeDataChart: any = {}
  totalUsageData: any = {}
  retiredQuiltData: any = {}
  mapDetails: any = {}
  mapLocationDetails: any[] = []
  dateRange: boolean = false;
  dateRangeCustom: boolean = true;
  //Add new
  isPalletScan: boolean = false;
  output: string = "";
  newPallets: any[] = [];
  totalQuilts: number = 0;
  private _items$ = new BehaviorSubject<[]>([]);
  private _items$1 = new BehaviorSubject<[]>([]);
  private unsubscribe: Subscription[] = [];
  private subscriptions: Subscription[] = [];
  @ViewChild("chart")
  chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions> | any;
  @ViewChild("chart1")
  chart1!: ChartComponent;
  public chartOptions1: Partial<ChartOptions1> | any;
  @ViewChild("chart2")
  chart2!: ChartComponent;
  public chartOptions2: Partial<ChartOptions1> | any;
  @ViewChild("chart3")
  chart3!: ChartComponent;
  public chartOptions3: Partial<ChartOptions1> | any;
  @ViewChild("chart4")
  chart4!: ChartComponent;
  public chartOptions4: Partial<ChartOptions> | any;
  display: boolean = true;
  isSelected: boolean = false;
  chartTotalCount: number;
  noChart: boolean = false;
  contentView: string = "cards";
  tab: string = this.activatedRoute?.snapshot?.queryParams?.tab;
  tabIndex: any = 0;
  tabChangeSub: Subscription;
  totalQuiltsForm: FormGroup;
  quiltsMovementForm: FormGroup;
  quiltsLocationForm: FormGroup;
  quiltActivityForm: FormGroup;
  quiltByCustomerIdForm: FormGroup;
  quiltLookupForm: FormGroup;
  quiltLocationLookupForm: FormGroup;
  inventoryOverviewFilters: FormGroup;
  usedFilters: FormGroup;
  usageBySizeFilters: FormGroup;
  totalUsageFilter: FormGroup;
  customerName: any;
  // companyId: number;
  companies: any[] = [];
  regionId: number = 0;
  allCompanyRegions: any[] = [];
  loggedInUserRole: Roles;
  loggedInCustomerId: any;
  loggedInLocationId: any;
  loggedInRegionId: number;
  customerTypeId: number;
  userDetails: any;
  orderTypeId: any;
  resultType: any;
  location: any[] = [];
  companiesArr: any[] = [];
  locationArr: any[] = [];
  locArr: any[] = [];
  startDate: any;
  startDateForData: any;
  endDateForData: any;
  endDate: any;
  endDat: any;
  startDat: any;
  quiltSerialNumber: any;
  quiltType: any;
  palletSerialNumber: any;
  quiltStatus: any;
  currentLocation: any;
  origin: any;
  destination: any;
  lastKnownLocation: any;
  maxDate = new Date();
  masterAdminRoles: string[] = [this.roleEnum.masterAdmin, this.roleEnum.warehouseUser];
  masterAdmin: string[] = [this.roleEnum.masterAdmin];
  companyAdminRoles: string[] = [this.roleEnum.customerAdmin];
  locationUserRoles: string[] = [this.roleEnum.customerManager];
  wareHouseUserRoles: string[] = [this.roleEnum.warehouseUser];
  regionSpecificUserRoles: string[] = [this.roleEnum.serviceManager, this.roleEnum.customerAdmin, this.roleEnum.customerManager];
  isUserSpecificRole: boolean = false;
  dataArray: any[] = [];
  customerIds: any[] = [];
  customerNameId: any[] = [];
  locationNameId: any[] = [];
  filteredCompany: boolean = false;
  filteredLocation: boolean = false;
  allDetailsRequired: boolean;
  locationType: number = 0;
  companyType: number = 0;
  orderName: any;
  markers: any = [];
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

  mapZoom = 2;
  mapCenter: google.maps.LatLng;
  mapLocationSize: string = '';
  mapLocationQuantity: number = 0;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 4,
  };

  markerInfoContent = '';
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP,
  };

  address: string;
  formattedAddress?: string | null = null;
  locationCoords?: google.maps.LatLng | null = null;



  openInfoWindow(marker: MapMarker, item: any) {
    this.markerInfoContent = item.pinArr;
    this.infoWindow.open(marker);
  }

  openInfoWindowForLoc(marker: MapMarker) {
    this.infoWindow.open(marker);
  }

  get items$() {
    return this._items$.asObservable();
  }
  get items$1() {
    return this._items$1.asObservable();
  }
  length: number;
  pageSize = 10;
  pageSizeOptions: number[];
  isLoading: boolean = false;
  quiltMovData: any[] = [];
  locationData: any[] = [];
  locationName: any[] = [];
  locationIds: any[] = []
  sortingData: any;
  quiltLoc: any;
  quiltMovDataLoc: {} = {};
  locationCustomerName: any;
  locQuiltLeased: any;
  quiltByCustomerId: any = {};
  companyName: any;
  chartStatus: boolean = false;
  isDesc: boolean = false;
  order: boolean = false;
  allCustomers: any[] = [];
  allOrderNames: any[] = [];
  inventoryOverViewLoading: boolean = true;
  newUsedLoading: boolean = true;
  usageBySizeLoading: boolean = true;
  totalUsageLoading: boolean = true;
  retiredLoading: boolean = true;
  inventoryOverViewSeries: any[] = [];
  inventoryOverViewLabels: any[] = [];
  inventoryOverViewSeriesAll: any[] = [];
  inventoryOverViewLabelsAll: any[] = [];
  inventoryOverViewLocation: any[] = [];
  totallabelCount: number = 0
  usedLocation: any[] = []
  newUsedLabels: any[] = [];
  newUsedSeries: any[] = [];
  usageBySizeLabels: any[] = [];
  usageBySizeSeries: any[] = [];
  usageBySizeLabelsAll: any[] = [];
  usageBySizeSeriesAll: any[] = [];
  usageBySizeLocations: any[] = [];
  totalUsageLabels: any[] = [];
  totalUsageSeries: any[] = [];
  totalUsageLocations: any[] = [];
  fullTableData: any = {

  }
  thresholdDetail: any[] = [];
  companyIdsArr: number[] = [];
  allQuiltTypes: any[] = [];
  allCusRegionLocations: any[] = []
  gotResult: boolean = false;
  custGroupIdForCustomer: number
  datesofUsage = [
    { value: 'thirtyDays', viewValue: '30 Days' },
    { value: 'sixtyDays', viewValue: '60 Days' },
    { value: 'ninetyDays', viewValue: '90 Days' },
    { value: 'thisYear', viewValue: 'YTD' },
    { value: 'yearly', viewValue: 'Prior Yearly' },
    { value: 'twoyears', viewValue: '2 Years' },
    { value: 'threeyears', viewValue: '3 Years' }
  ];

  constructor(
    private modalService: NgbModal,
    private dashboardService: DashboardService,
    private InventoryService: InventoryService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    public datePipe: DatePipe,
    private fetchCustomerService: FetchCustomersService,
    private quiltTypesService: FetchQuiltTypesService,
    private reportService: ReportsService
  ) {
    this.chartOptions = {
      chart: {
        type: "donut"
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true
              },
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: any, opts: any) {
          return opts.w.globals.series[opts.seriesIndex];
        },
      },
      fill: {
        type: "gradient",
      },
      theme: {
        monochrome: {
          enabled: false
        }
      },
      responsive: [
        {
          breakpoint: 420,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ],
    };

    this.chartOptions4 = {
      series: [],
      chart: {
        width: "100%",
        height: 176,
        type: "pie"
      },
      plotOptions: {
        pie: {
          labels: {
            show: true,
            total: {
              showAlways: true,
              show: true
            }
          }
        }
      },
      labels: [],
      dataLabels: {
        enabled: true,
        formatter: function (val: any, opts: any) {
          return opts.w.globals.series[opts.seriesIndex];
        },
      },
      fill: {
        type: "gradient",
        colors: ["#000000", '#407EC9'],
      },

      theme: {
        monochrome: {
          enabled: false
        }
      },
      legend: {
        show: true,
        markers: {
          fillColors: ["#000000", '#407EC9']
        },
        // position: "bottom"
        // formatter: function (val: any, opts: any) {
        //   return opts.w.globals.series[opts.seriesIndex];
        // }
      },
      // title: {
      //   text: "Number of leads"
      // },
      responsive: [
        {
          breakpoint: 420,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ],
      colors: ["#000000", '#407EC9'],
      tooltip: {
        // enabled: true,
        fillSeriesColor: true,
      },
      states: {
        hover: {
          filter: {
            type: 'none'
          }
        }
      }
    };
  }


  ngOnInit(): void {
    // custGroupId
    this.userDetails = this.authService?.getUserFromLocalStorage()?.data || {};
    this.loggedInUserRole = this.userDetails?.roles[0] || "";
    // this.loggedInCustomerId = this.userDetails?.companyId || ""; 
    this.loggedInCustomerId = this.userDetails?.custGroupId || ""; 
    this.loggedInLocationId = this.userDetails?.locationId || "";
    this.loggedInRegionId = this.userDetails?.regionId || "";
    this.customerTypeId = this.userDetails?.customerTypeId || '';
    if (this.regionSpecificUserRoles.includes(this.loggedInUserRole)) {
      this.isUserSpecificRole = true;
    }
    this.companyType = 0;
    // this.initForm();
    // this.getCompanyRegions();
   
    this.fetchCustomerRegion();

    // this.initForm();
    this.customerIds = [];
    if (this.loggedInUserRole === this.roleEnum.customerAdmin && this.logStatus) {
      this.getThresholdCompare()
    }
    let date: Date = new Date();
    // this.endDateForData = moment(date).format("YYYY-MM-DD");
    // this.startDateForData = moment(date.setDate(date.getDate() - 30)).format("YYYY-MM-DD");
    // this.endDat = moment(date).format("MM-DD-YYYY");
    this.endDat = moment(date.setDate(date.getDate())).format("MM-DD-YYYY");
    this.startDat = moment(date.setDate(date.getDate() - 365)).format("MM-DD-YYYY");
    this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
    this.startDateForData = moment(date.setDate(date.getDate() - 365)).format("YYYY-MM-DD");
    console.log(this.endDateForData, this.startDateForData, this.endDat, this.startDat)
    // this.quiltActivityForm.controls.startDate.patchValue(this.startDat);
    // this.quiltActivityForm.controls.endDate.patchValue(this.endDat);

    // this.rangeForm.controls.rangeOpt.patchValue(this.selectedRange);
    // this.regionSelected.controls.customerRegion.patchValue(this.regionId);
    this.handleTabChangeSub();


    if ([this.roleEnum.masterAdmin, this.roleEnum.serviceManager, this.roleEnum.consignAdmin, this.roleEnum.globalAdmin].includes(this.loggedInUserRole)) {
      this.fetchAllCustomers();
      // this.getQuiltsMovement();
    }
    // else if ([this.roleEnum.globalAdmin].includes(this.loggedInUserRole)) {
    //   this.custGroupIdForCustomer = this.authService?.getUserFromLocalStorage()?.data?.custGroupId || "";
    //   this.fetchAllCustGroups()
    // }
    // this.getChartsData()

    // this.onSearchByValueChange();
  }

  rolePageLoad() {
    this.markers = [];
    // this.companyType = 0;
    this.initForm();
    this.quiltMovData = [];

    // this.getChartsData()
    if (!this.tab) {
      if ((this.loggedInUserRole == this.roleEnum.consignAdmin || this.loggedInUserRole == this.roleEnum.consignManager)) {
        this.tab = Tabs1[0];
      } else if (this.loggedInUserRole == this.roleEnum.customerAdmin || this.loggedInUserRole == this.roleEnum.customerManager) {
        if ([1, 3].includes(this.customerTypeId)) {
          this.tab = "leased";
        } else {
          this.tab = "purchased";
        }
      }
    }

    if (([this.roleEnum.customerAdmin].includes(this.loggedInUserRole) && [1, 3].includes(this.customerTypeId) && (this.tab === "leased" || !this.tab)) ||
      (![this.roleEnum.customerAdmin].includes(this.loggedInUserRole) && (this.tab === "leased" || !this.tab))) {
      this.orderTypeId = 1;
    }
    else if (([this.roleEnum.customerAdmin].includes(this.loggedInUserRole) && [2, 3].includes(this.customerTypeId) && (this.tab === "purchased" || !this.tab)) ||
      (![this.roleEnum.customerAdmin].includes(this.loggedInUserRole) && this.tab === "purchased")) {
      this.orderTypeId = 2;
    } else if (this.tab === "consigned") {
      this.orderTypeId = 3;
    }
    if ([this.roleEnum.masterAdmin, this.roleEnum.globalAdmin, this.roleEnum.consignAdmin, this.roleEnum.consignManager, this.roleEnum.serviceManager].includes(this.loggedInUserRole)) {
      this.resultType = 1;
      this.location = [];
      this.locationArr = [];
      if ([this.roleEnum.serviceManager].includes(this.loggedInUserRole)) {
        this.regionId = +this.loggedInRegionId
      }
      this.getQuiltsMovement();

    } else if (this.companyAdminRoles.includes(this.loggedInUserRole)) {
      this.resultType = 1;
      // this.companies = [this.loggedInCustomerId];
      this.companiesArr = [this.loggedInCustomerId];
      this.quiltMovData = []
      this.allDetailsRequired = true;
      this.getQuiltsMovement();

    } else if (this.locationUserRoles.includes(this.loggedInUserRole)) {
      this.resultType = 1;
      this.location = this.loggedInLocationId;
      this.companies = this.loggedInCustomerId;
      this.locationArr = [this.loggedInLocationId];
      this.companiesArr = [this.loggedInCustomerId];
      this.getQuiltsMovementByLocationId();

    }
    this.getChartsData();
    // this.fetchCustomerRegion()

  }

  getChartsData() {
    // this.quiltMovData = [];

    this.getTotalQuiltsData();
    this.getUsedData();
    this.usageSizeDates();
    //this.getUsagesSize();
    this.totalUsageDates();
    if ([this.roleEnum.masterAdmin].includes(this.loggedInUserRole)) {
      this.getRetiredQuilts();
    }
    if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      this.getAllOrderNames()
    }
    // this.getTotalUsage();
    this.getMapLoaction(this.orderTypeId);
  }

  dateCalc(range: number) {
    let date: Date = new Date();
    this.dateRange = false;
    this.dateRangeCustom = true;
    this.endDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
    this.startDate = moment(date.setDate(date.getDate() - range)).format("YYYY-MM-DD");
    this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
    this.startDateForData = moment(date.setDate(date.getDate() - range)).format("YYYY-MM-DD");
    // this.usageSize.controls.fromDate.patchValue(this.startDate);
    // this.usageSize.controls.toDate.patchValue(this.endDate);
    // this.getUsagesSize()
  }

  calculateDateRange(dValue: any, fromDateControl: any, toDateControl: any) {
    let date: Date = new Date();
    let fromDate: any, toDate: any;
    if (dValue === "thirtyDays") {
      toDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      fromDate = moment(date.setDate(date.getDate() - 29)).format("YYYY-MM-DD");
    }
    else if (dValue === "sixtyDays") {
      toDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      fromDate = moment(date.setDate(date.getDate() - 59)).format("YYYY-MM-DD");
    }
    else if (dValue === "ninetyDays") {
      toDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      fromDate = moment(date.setDate(date.getDate() - 89)).format("YYYY-MM-DD");
    } else if (dValue === 'thisYear') {
      toDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      fromDate = moment().startOf('year').format("YYYY-MM-DD");
      // let date: Date = new Date();
      // this.dateRange = false;
      // this.dateRangeCustom = true;
      // this.endDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      // this.startDate = moment().startOf('year').format("YYYY-MM-DD");
      // this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      // this.startDateForData = moment().startOf('year').format("YYYY-MM-DD")
    }
    else if (dValue === "yearly") {
      toDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      fromDate = moment(date.setDate(date.getDate() - 364)).format("YYYY-MM-DD");
    } else if (dValue === "twoyears") {
      toDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      fromDate = moment(date.setDate(date.getDate() - 729)).format("YYYY-MM-DD");
    } else if (dValue === "threeyears") {
      toDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      fromDate = moment(date.setDate(date.getDate() - 1094)).format("YYYY-MM-DD");
    }
    fromDateControl.patchValue(fromDate);
    toDateControl.patchValue(toDate);
    this.cd.detectChanges()
  }

  

  fetchQuiltTypes() {
    let apiCalled = false;
    const userData = this.authService.getUserFromLocalStorage()?.data || {};
    if (userData?.roles[0] == (this.roleEnum.customerAdmin) || userData?.roles[0] == (this.roleEnum.customerManager)) {
      this.quiltTypesService.getQuiltTypesForSpecificRole(this.orderTypeId).subscribe((res:any) =>{
        // console.log(res.data)
        this.allQuiltTypes = res.data;
      })
    }else{
      const quiltTypesOption = this.quiltTypesService.quiltTypes.subscribe((types) => {
        if (types.length && apiCalled) {
          this.allQuiltTypes = types;
        } else if (!apiCalled) {             
        apiCalled = true;
        this.quiltTypesService.getQuiltTypes()
        }
      })
      this.unsubscribe.push(quiltTypesOption);
    }

    
  }

  fetchCustomerRegion() {
    this.spinner.show();
    const regionSub = this.dashboardService.getCustomerRegionLocations(+this.companyType).subscribe((res:any) => {
      debugger
      if (res.statusCode === 200) {

        this.allCusRegionLocations = res?.data;
        // console.log(this.allCusRegionLocations)
        this.spinner.hide();
        this.rolePageLoad();
        this.fetchQuiltTypes();
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(regionSub);
  }
  getCompanyRegions() {
    const companyNames = this.dashboardService.getCompaniesRegion().subscribe((res) => {
      if (res.statusCode === 200) {
        this.allCompanyRegions = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(companyNames);
  }
  getAllOrderNames() {
    const orderNames = this.dashboardService.getAllOrderNames().subscribe((res) => {
      if (res.statusCode === 200) {
        this.allOrderNames = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(orderNames);
  }
  fetchAllCustGroups() {
    this.spinner.show();
    let apiCalled = false;
    const customersSub = this.reportService.getCustomersByGroup(+this.custGroupIdForCustomer).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.allCustomers = res?.data;
      } else if (res.message) {
        this.toastr.error(res.message)
      }
    })
    this.unsubscribe.push(customersSub);
  }

  fetchAllCustomers() {
    let apiCalled = false;
    console.log(this.userDetails?.roles[0] == (this.roleEnum.globalAdmin)) 
    if(this.userDetails?.roles[0] == (this.roleEnum.globalAdmin)){
      this.fetchCustomerService.getAllCustomersInGlobalAdmin();
      this.fetchCustomerService.globalAdminCustomer.subscribe((customers) => {
        this.allCustomers = customers; 
      })
    }else{
    this.fetchCustomerService.getAllCustomers(false, false);
      const allCustomersSub = this.fetchCustomerService.allCustomers.subscribe((customers) => {
        this.allCustomers = customers; 
      })
  
      this.unsubscribe.push(allCustomersSub);
    }
  }

  regionChange(rId: any) {
    this.regionId = rId;
    // const { pageNumber } = this.quiltsMovementForm.controls;
    // const { regionId } = this.totalQuiltsForm.controls;
    // const searchByValueSub = regionId.valueChanges.pipe(debounceTime(300)).subscribe(() => {
    //   pageNumber.patchValue(1);

    this.getQuiltsMovement();
    // })
    // this.unsubscribe.push(searchByValueSub);
    // console.log(this.regionId);

  }

  consignFilter(cfilter: any) {
    this.locationType = cfilter;
    this.getQuiltsMovement();
  }

  companyFilter(cusfilter: any) {
    this.companyType = cusfilter;
    this.fetchCustomerRegion();
    // this.getChartsData();
    // this.getQuiltsMovement();
  }
  orderNameFilter(nameId: any) {
    const name = this.allOrderNames.find(x => x.id == nameId).name
    this.orderName = name
    this.fetchCustomerRegion();
    this.getQuiltsMovement();
  }

  selectCustomer(customer: any, customerName: any): void {
    if (!this.customerIds.includes(customer) && !this.companies.includes(customerName)) {
      this.customerIds.push(customer);
      this.companies.push(customer);
      this.companyName = customerName;
      this.isSelected = true;
      // this.getQuiltsMovement();
      // this.findAddressForCustomerId(this.customerIds)
    } else {
      const index = this.customerIds.indexOf(customer, customerName);
      this.customerIds.splice(index, 1);
      // this.companies.splice(index, 1);
      this.isSelected = false;
      // this.getQuiltsMovement();
    }
  }

  initForm() {

    this.quiltsMovementForm = this.fb.group({
      sortByColumn: "",
      sortDescendingOrder: true,
      searchBy: "",
      pageNumber: 1,
      pageSize: 10,
      startDate: "",
      endDate: ""
    });

    this.totalQuiltsForm = this.fb.group({
      orderTypeId: [this.orderTypeId],
      companyIds: [this.companyIdsArr],
      regionId: +this.regionId,
      startDate: null,
      endDate: null,
      orderNickName: ''
    });

    this.donutChart = this.fb.group({
      regionId: this.fb.array([]),
      customerId: this.fb.array([]),
      locationId: this.fb.array([]),
      orderTypeId: [this.orderTypeId],
      consigned: false,
      quiltSize: 0,
      orderNickName: ''
    });
    this.usedChart = this.fb.group({
      regionId: this.fb.array([]),
      customerId: this.fb.array([]),
      locationId: this.fb.array([]),
      orderTypeId: [this.orderTypeId],
      consigned: false,
      quiltSize: 0,
      orderNickName: ''
    });



    this.usageSize = this.fb.group({
      regionId: this.fb.array([]),
      customerId: this.fb.array([]),
      locationId: this.fb.array([]),
      orderTypeId: [this.orderTypeId],
      consigned: false,
      fromDate: null,
      toDate: null,
      orderNickName: ''
    });
    this.totalUsage = this.fb.group({
      regionId: this.fb.array([]),
      customerId: this.fb.array([]),
      locationId: this.fb.array([]),
      orderTypeId: [this.orderTypeId],
      consigned: false,
      fromDate: null,
      toDate: null,
      orderNickName: ''
    });

    this.quiltsLocationForm = this.fb.group({
      pageNumber: 1,
      pageSize: 10,
    });

    this.quiltActivityForm = this.fb.group({
      startDate: "",
      endDate: ""
    })

    this.chartForm = this.fb.group({
      chartOpt: [this.selectedOption],
    });

    this.rangeForm = this.fb.group({
      rangeOpt: [this.selectedRange]
    });

    this.regionSelected = this.fb.group({
      customerRegion: +this.regionId
    })
    this.consignDrop = this.fb.group({
      locationtyprid: +this.locationType
    })
    this.dateGroup = this.fb.group({
      dateId: 'thisYear'
    })
    // this.companyDrop = this.fb.group({
    //   companytyprid: +this.companyType
    // })
    this.quiltLookupForm = this.fb.group({
      serialNumber: [""]
    })
    this.quiltLocationLookupForm = this.fb.group({
      searchByLocation: [""]
    })
   
    this.inventoryOverviewFilters = this.fb.group({
      quiltTypeId: ["0"],
      continentId: ["0"],
      // regionId: [this.allCusRegionLocations[0].id],
      locationId: ["0"],
      orderTypeId: [this.orderTypeId],
      quiltSize: ["0"],
      orderNickName: ''
    })

    this.inventoryOverviewFilters.controls.continentId.valueChanges.subscribe(m => {
      if (m == 0) {
        this.inventoryOverViewLocation = [];
        this.inventoryOverviewFilters.controls.locationId.reset('0')
      } else {
        this.inventoryOverViewLocation = this.allCusRegionLocations.find(x => x.id == m).locations;


        // If locations are available, reset locationId to '0' (All locations)
        if (this.inventoryOverViewLocation.length > 0) {
          this.inventoryOverviewFilters.controls.locationId.setValue('0'); // Reset to 'All'
        } else {
          this.inventoryOverviewFilters.controls.locationId.reset('0'); // No location
        }
      }
      // if (!this.isUserSpecificRole)
        this.getTotalQuiltsData();
      // this.cd.detectChanges();
    })
    this.inventoryOverviewFilters.controls.locationId.valueChanges.subscribe(m => {
      this.getTotalQuiltsData();
      // this.cd.detectChanges();
    })
    this.inventoryOverviewFilters.controls.quiltSize.valueChanges.subscribe(m => {
      this.getTotalQuiltsData();
      // this.cd.detectChanges();
    })

    this.usedFilters = this.fb.group({
      quiltTypeId: ["0"],
      continentId: ["0"],
      locationId: ["0"],
      orderTypeId: [this.orderTypeId],
      quiltSize: ["0"],
      orderNickName: ''
    })
    this.usedFilters.controls.continentId.valueChanges.subscribe(m => {
      if (m == 0) {
        this.usedLocation = [];
        this.usedFilters.controls.locationId.reset('0')
      } else {
        this.usedLocation = this.allCusRegionLocations.find(x => x.id == m).locations;


        // If locations are available, reset locationId to '0' (All locations)
        if (this.usedLocation.length > 0) {
          this.usedFilters.controls.locationId.setValue('0'); // Reset to 'All'
        } else {
          this.usedFilters.controls.locationId.reset('0'); // No location
        }
      }
      // if (!this.isUserSpecificRole) {
        this.getUsedData();
      // }
      // this.cd.detectChanges();
    })
    this.usedFilters.controls.locationId.valueChanges.subscribe(m => {
      this.getUsedData();
      // this.cd.detectChanges();
    })
    this.usedFilters.controls.quiltSize.valueChanges.subscribe(m => {
      this.getUsedData();
      // this.cd.detectChanges();
    })
    this.usageBySizeFilters = this.fb.group({
      quiltTypeId: ["0"],
      continentId: ["0"],
      locationId: ["0"],
      orderTypeId: [this.orderTypeId],
      fromDate: null,
      toDate: null,
      dateId: ['thisYear'],
      orderNickName: ''
    })

    this.usageBySizeFilters.controls.continentId.valueChanges.subscribe(m => {
      if (m == 0) {
        this.usageBySizeLocations = [];
        this.usageBySizeFilters.controls.locationId.reset('0')
      } else {
        this.usageBySizeLocations = this.allCusRegionLocations.find(x => x.id == m).locations;


      // If locations are available, reset locationId to '0' (All locations)
      if (this.usageBySizeLocations.length > 0) {
        this.usageBySizeFilters.controls.locationId.setValue('0'); // Reset to 'All'
      } else {
        this.usageBySizeFilters.controls.locationId.reset('0'); // No location
      }
      }
      // if (!this.isUserSpecificRole)
        this.getUsagesSize();
      // this.cd.detectChanges();
    })
    this.usageBySizeFilters.controls.locationId.valueChanges.subscribe(m => {
      this.getUsagesSize();
      // this.cd.detectChanges();
    })
    this.usageBySizeFilters.controls.dateId.valueChanges.subscribe(m => {
      this.calculateDateRange(m, this.usageBySizeFilters.controls.fromDate, this.usageBySizeFilters.controls.toDate);
      this.getUsagesSize();
      // this.cd.detectChanges();
    })
    // this.usageBySizeFilters.controls.toDate.valueChanges.subscribe(m => {
    //   this.getUsagesSize();
    //   this.cd.detectChanges();
    // })
    this.totalUsageFilter = this.fb.group({
      quiltTypeId: ["0"],
      continentId: ["0"],
      locationId: ["0"],
      orderTypeId: [this.orderTypeId],
      fromDate: null,
      toDate: null,
      dateId: ['thisYear'],
      orderNickName: ''
    })

    this.totalUsageFilter.controls.continentId.valueChanges.subscribe(m => {
      if (m == 0) {
        this.totalUsageLocations = [];
        this.totalUsageFilter.controls.locationId.reset('0')
      } else {
        this.totalUsageLocations = this.allCusRegionLocations.find(x => x.id == m).locations;

        
        // If locations are available, reset locationId to '0' (All locations)
        if (this.totalUsageLocations.length > 0) {
          this.totalUsageFilter.controls.locationId.setValue('0'); // Reset to 'All'
        } else {
          this.totalUsageFilter.controls.locationId.reset('0'); // No location
        }
      }
      // if (!this.isUserSpecificRole)
        this.getTotalUsage();
      // this.cd.detectChanges();
    })
    this.totalUsageFilter.controls.locationId.valueChanges.subscribe(m => {
      this.getTotalUsage();
      // this.cd.detectChanges();
    })
    this.totalUsageFilter.controls.dateId.valueChanges.subscribe(m => {
      this.calculateDateRange(m, this.totalUsageFilter.controls.fromDate, this.totalUsageFilter.controls.toDate);
      this.getTotalUsage();
      // this.cd.detectChanges();
    })
    // if (this.regionSpecificUserRoles.includes(this.loggedInUserRole)) {
    //   let regionId = this.allCusRegionLocations[0].id;
    //   if (regionId && regionId > 0) {
    //     this.inventoryOverviewFilters.controls.continentId.patchValue(regionId);
    //     this.usedFilters.controls.continentId.patchValue(regionId);
    //     this.usageBySizeFilters.controls.continentId.patchValue(regionId);
    //     this.totalUsageFilter.controls.continentId.patchValue(regionId);
    //   }
    // }
    // this.totalUsageFilter.controls.toDate.valueChanges.subscribe(m => {
    //   this.getTotalUsage();
    //   this.cd.detectChanges();
    // })
  }
  get customerArr0() {
    return this.donutChart.controls['customerId'] as FormArray
  }
  get locationArr0() {
    return this.donutChart.controls['locationId'] as FormArray
  }
  get regionArr0() {
    return this.donutChart.controls['regionId'] as FormArray
  }
  get usedCustomerArr0() {
    return this.usedChart.controls['customerId'] as FormArray
  }
  get usedLocationArr0() {
    return this.usedChart.controls['locationId'] as FormArray
  }
  get usedRegionArr0() {
    return this.usedChart.controls['regionId'] as FormArray
  }
  get usedSizeCustomerArr0() {
    return this.usageSize.controls['customerId'] as FormArray
  }
  get usedSizeLocationArr0() {
    return this.usageSize.controls['locationId'] as FormArray
  }
  get usedSizeRegionArr0() {
    return this.usageSize.controls['regionId'] as FormArray
  }
  get totalUseCustomerArr0() {
    return this.totalUsage.controls['customerId'] as FormArray
  }
  get totalUseLocationArr0() {
    return this.totalUsage.controls['locationId'] as FormArray
  }
  get totalUseRegionArr0() {
    return this.totalUsage.controls['regionId'] as FormArray
  }
  get f() {
    return this.chartForm.controls;
  }

  get a() {
    return this.rangeForm.controls;
  }
  get formValues(): any {
    return this.totalQuiltsForm.getRawValue();
  }

  get inventoryOverviewFilterValue(): any {
    return this.inventoryOverviewFilters.getRawValue();
  }
  get usedchartFilterValue(): any {
    return this.usedFilters.getRawValue();
  }
  get usageSizeFilterValue(): any {
    return this.usageBySizeFilters.getRawValue();
  }
  get totalUsageFilterValue(): any {
    return this.totalUsageFilter.getRawValue();
  }

  sortName(property: any) {
    this.isDesc = !this.isDesc;
    let direction = this.isDesc ? 1 : -1;
    this.sortingData.sort(function (a: any, b: any) {
      if (a[property] < b[property]) {
        return -1 * direction;
      }
      else if (a[property] > b[property]) {
        return 1 * direction;
      }
      else {
        return 0;
      }
    })
  };

  sortDataOnHand() {
    if (this.order) {
      let newArr = this.sortingData.sort((a: any, b: any) => { a.onhand - b.onhand });
      this.sortingData = newArr
    }

    else {
      let newArr = this.sortingData.sort((a: any, b: any) => b.onhand - a.onhand);
      this.sortingData = newArr
    }

    this.order = !this.order;
  }

  sortDataInBound() {
    if (this.order) {
      let newArr = this.sortingData.sort((a: any, b: any) => { a.inbound - b.inbound });
      this.sortingData = newArr
    }

    else {
      let newArr = this.sortingData.sort((a: any, b: any) => b.inbound - a.inbound);
      this.sortingData = newArr
    }

    this.order = !this.order;
  }

  sortDataOutBound() {
    if (this.order) {
      let newArr = this.sortingData.sort((a: any, b: any) => { a.outbound - b.outbound });
      this.sortingData = newArr
    }

    else {
      let newArr = this.sortingData.sort((a: any, b: any) => b.outbound - a.outbound);
      this.sortingData = newArr
    }

    this.order = !this.order;
  }

  handleTabChangeSub(): void {
    this.tabChangeSub = this.activatedRoute?.queryParams?.subscribe((queryParams) => {
      const tab: any = queryParams as { tab: string };
      let index = this.tabIndex;
      if (!!tab.tab && [this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole)) {
        this.tabIndex = Tabs1[tab.tab];
      } else if (!!tab.tab) {
        this.tabIndex = Tabs[tab.tab];
      }
      if (index && index != this.tabIndex) {
        this.rolePageLoad();
      }
    });

  }

  serialsReport(cusId: number, cusName: string, locId: number, reportId: number, inputReportType: number, outputReportType: number) {
    if (!cusId) cusId = this.loggedInCustomerId;
    if (!locId) locId = this.loggedInLocationId;
    this.locationIds.push(locId);
    if (reportId === 6) {
      this.router.navigate(['/reports/quilt-onHand'], { queryParams: { customerId: cusId, customerName: cusName, orderType: this.orderTypeId, locationIds: this.locationIds, typeOfReport: +reportId, startDate: moment().format("MM/DD/YYYY"), dashboardView: true } });
    }
    else if (reportId === 7) {
      this.router.navigate(['/reports/quilt-inbound'], { queryParams: { customerId: cusId, customerName: cusName, orderType: this.orderTypeId, locationIds: this.locationIds, typeOfReport: +reportId, startDate: moment().format("MM/DD/YYYY"), dashboardView: true, inputReportType: +inputReportType } });
    }
    else if (reportId === 8) {
      this.router.navigate(['/reports/quilt-outbound'], { queryParams: { customerId: cusId, customerName: cusName, orderType: this.orderTypeId, locationIds: this.locationIds, typeOfReport: +reportId, startDate: moment().format("MM/DD/YYYY"), dashboardView: true, outputReportType: +outputReportType } });
    }
  }

  onStartingDateScheduledRange({ value }: { value: any }) {
    // const { startDate } = this.startDate;
    // this.startDate = moment(value).format("MM-DD-YYYY");
    this.startDat = value;
    //this.getQuiltsMovement();
  }

  onEndingDateScheduledRange({ value }: { value: any }) {
    // const { endDate } = this.endDate;
    // this.endDate = moment(value).format("MM-DD-YYYY");
    this.endDat = value;
    this.chartStatus = false;
    // this.quiltActivityData();
  }
  quiltLookupSearch() {
    this.onSearchByValueChange()
  }
  palletLookupSearch() {
    this.isPalletScan = true;
    const serialNumber = this.quiltLookupForm.get("serialNumber")?.value;
    this.loadPalletAndOpenPopup(serialNumber);
    // Clear so Quilt lookup does not show
    this.quiltLookupForm.get("serialNumber")?.patchValue("");
  }

  private loadPalletAndOpenPopup(serialNumber: string) {
    const serial = serialNumber?.trim();

    if (!serial) {
      this.toastr.warning("Please enter a pallet serial number");
      return;
    }

    this.spinner.show();

    this.dashboardService.getPalletDetails(serial).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        console.log("📦 Pallet Details Response:", res);

        const palletData = res?.data?.palletList?.pallets?.[0];

        if (!palletData) {
          this.toastr.error("Pallet not found");
          return;
        }

        // Map only what popup needs
        const palletDataMapped = {
          serialNumber: palletData.serialNumber ?? "",
          description:
            palletData.description ??
            palletData.customerFacingDescription ??
            palletData.palletDescription ??
            "--",
          totalQuilts: palletData.totalQuilts ?? palletData.quiltCount ?? 0,
          palletStatus: palletData.palletStatus ?? "--",
          location: palletData.location ?? "--"
        };


        console.log("🧵 Mapped Pallet Data:", palletDataMapped);

        this.openPalletDetailModal(palletDataMapped);
      },
      error: (err) => {
        this.spinner.hide();
        console.error("❌ Pallet Details Error:", err);
        this.toastr.error("Failed to fetch pallet details");
      }
    });
  }

  openScannerModalForPallet() {
    const modalRef = this.modalService.open(ScannerModalComponent, {
      size: "lg",
      centered: true,
      windowClass: "modal-dialog-centered",
      backdrop: 'static'
    });

    modalRef.result.then((result) => {
      console.log("🔍 QR Scan Result:", result);

      // If your scanner returns { output: 'P12345' }
      const scannedValue = (result?.output || result || "").toString().trim();

      if (!scannedValue) {
        this.toastr.warning("No pallet number scanned");
        return;
      }

      //Add new
      this.isPalletScan = true;
      this.loadPalletAndOpenPopup(scannedValue);
      // Put scanned value into the input field 
      this.quiltLookupForm.controls['serialNumber'].patchValue("");
      
      
    }).catch(() => {
      // Modal dismissed – do nothing
    });
  }

  openPalletDetailModal(data: any) {
    const modalRef = this.modalService.open(PalletDetailsComponent, {
      size: "md",
      centered: true,
      backdrop: true
    });
    modalRef.componentInstance.palletData = data;
  }
  locationLookupSearch() {
    const locationValue = this.quiltLocationLookupForm.controls.searchByLocation.value;
    let location = this.mapLocationDetails.find(x => x.locationName === locationValue);
    if (location) {
      let locationlat = location.latitude;
      let locationlong = location.longitude;
      let markerData = location.mapLocationQuilts;
      if (locationlat && locationlong) {
        this.openLocationMapModal(locationlat, locationlong, markerData);
      }
    }
  }


  openData(toggleTo: boolean, index: number) {
    this.collapsed = toggleTo;
    if (toggleTo === true) {
      this.collapsedNot = index;
    } else {
      this.collapsedNot = undefined;
    }
  }


  getQuiltsMovement() {
    debugger
    this.spinner.show();
    if (+this.companyType) {
      this.companies=[];
      this.companies.push(+this.companyType)
    }
    console.log(this.orderTypeId);

    // if ([this.roleEnum.customerAdmin].includes(this.loggedInUserRole)) {
    //   this.orderTypeId = this.orderTypeId;
    //   debugger
    // }
    const quiltsMov = this.dashboardService.getAllQuiltsMovement(this.quiltsMovementForm.getRawValue(), this.orderTypeId, +this.regionId, +this.locationType, +this.companyType, this.companies, this.location, this.startDate, this.endDate, this.allDetailsRequired, this.orderName).subscribe((res) => {
      if (res.statusCode == 200) {
        if (res.data && res.data.result) {
          this._items$.next(res.data.result.quiltMovements);
          this.quiltMovData = res.data.result.quiltMovements;
          this.quiltMovData.forEach((el: any) => {
            this.sortingData = el.quiltsDistributions;
            this.locationData = el.quiltsDistributions;
            this.companyIdsArr.push(el.customerId)
          })
          // this.getTotalQuiltsData();
          // this.getUsedData()
          // this.getUsagesSize();
          // this.getTotalUsage()
          // this.getRetiredQuilts()
          // this.getMapLoaction()
          // this.locationData.forEach((item:any) =>{
          //   this.locationName.push(item.locationName)
          // })
          // console.log(this.locationName)
          this.length = res.data.totalCount;
          this.pageSizeOptions = [5, 10];
          this.companyIdsArr = []
          // this.companies = []
          if (!this.pageSizeOptions.includes(this.length)) {
            this.pageSizeOptions.push(this.length)
          }
          if (this.length < 5) {
            this.pageSizeOptions = [5, 10];
          }
          // this.locationData = res.data.result.quiltMovements.quiltsDistributions;
          this.movementsMark(res.data.result.quiltMovements)
          let locations = res.data.result.locations;
          // locations.forEach((location: any) => {
          // if (location.latitude && location.longitude) {
          //   const point: google.maps.LatLngLiteral = {
          //     lat: location.latitude,
          //     lng: location.longitude
          //   };


          //   this.locationCoords = new google.maps.LatLng(point);

          //   this.mapCenter = new google.maps.LatLng(point);
          //   this.map.panTo(point);
          //   let address: string = '';

          //   address = `${location.address} ${location.city}`;
          //   if (location.state && location.state != '') {
          //     address = `${address} ${location.state}`;
          //   }
          //   if (location.country && location.country != '') {
          //     address = `${address} ${location.country}`;
          //   }
          //   if (location.onhand || location.onhand === 0) {
          //     address = `${address}, OnHand - ${location.onhand}`;
          //   }
          //   if (location.inbound || location.inbound === 0) {
          //     address = `${address}, InBound - ${location.inbound}`;
          //   }
          //   if (location.outbound || location.outbound === 0) {
          //     address = `${address}, OutBound - ${location.outbound}`;
          //   }
          //   // this.address = address;
          //   // this.formattedAddress = address;
          //   // this.markerInfoContent = address;
          //   let locObj = { mapCenter: this.mapCenter, address: address }
          //   this.markers.push(locObj);
          // }
          // });
          // this.getChartsData()
          this.spinner.hide();
          // this.cd.detectChanges();
        } else {
          this.spinner.hide();
        }
      }
      else {
        this.toastr.error(res.message);
      }

      this.unsubscribe.push(quiltsMov);
      // console.log(mapArrLat, mapArrLng, mapArrAdd, mapArrCity, mapArrState, mapArrCountry) 



      // this.markerOptions = {
      //   draggable: false,
      //   animation: google.maps.Animation.DROP,
      // };
      // this.markers = [{
      //   position: {
      //     lat:mapArrLat,
      //     lng: mapArrLng
      //   },
      //   options: { animation: google.maps.Animation.BOUNCE },
      // }]
      // this.markers.push({
      //   position: {
      //     lat:mapArrLat,
      //     lng: mapArrLng
      //   },
      //   options: { animation: google.maps.Animation.BOUNCE },
      // })



      // this.spinner.show();
    });

  }

  movementsMark(qui: any) {
    if (qui) {
      qui.forEach((element: any) => {
        // console.log(element.quiltsDistributions);
        element.quiltsDistributions.forEach((location: any) => {
          if (location.latitude && location.longitude) {
            const point: google.maps.LatLngLiteral = {
              lat: location.latitude,
              lng: location.longitude
            };


            this.locationCoords = new google.maps.LatLng(point);

            this.mapCenter = new google.maps.LatLng(point);
            this.map.panTo(point);
            let address: string = '';

            address = `OnHand - ${location.onhand}, InBound - ${location.inbound}, OutBound - ${location.outbound}`;
            // address = `${location.address} ${location.city}`;
            // if (location.state && location.state != '') {
            //   address = `${address} ${location.state}`;
            // }
            // if (location.country && location.country != '') {
            //   address = `${address} ${location.country}`;
            // }
            // if (location.onhand || location.onhand === 0) {
            //   address = `${address}, OnHand - ${location.onhand}`;
            // }
            // if (location.inbound || location.inbound === 0) {
            //   address = `${address}, InBound - ${location.inbound}`;
            // }
            // if (location.outbound || location.outbound === 0) {
            //   address = `${address}, OutBound - ${location.outbound}`;
            // }
            // this.address = address;
            // this.formattedAddress = address;
            // this.markerInfoContent = address;
            let locObj = { mapCenter: this.mapCenter, address: address }
            this.markers.push(locObj);
          }
        })
      });
    }
  }
  quiltLocationMark(qui: any) {
    if (qui) {
      qui.forEach((element: any) => {
        let locObj1 = { size: 'XXXX', quantity: 0 };
        let pinInfo: any[] = []
        if (element.latitude && element.longitude) {
          const point: google.maps.LatLngLiteral = {
            lat: element.latitude,
            lng: element.longitude
          };

          this.locationCoords = new google.maps.LatLng(point);
          element.mapLocationQuilts.forEach((item: any) => {

            this.mapLocationSize = item.size;
            this.mapLocationQuantity = item.quantity;
            locObj1 = { size: item.size, quantity: item.quantity }
            pinInfo.push(locObj1)
          })
          this.mapCenter = new google.maps.LatLng(point);
          this.map.panTo(point);
          let address: string = '';
          let locObj = {
            mapCenter: this.mapCenter, label: {
              color: 'green',
              text: 'Marker label ' + (this.markers.length + 1),
            },
            title: 'Marker title ' + (this.markers.length + 1), address: address, pinArr: pinInfo
          }
          this.markers.push(locObj);
        }
      });
    }
  }

  getQuiltsMovementByLocationId() {
    this.spinner.show();
    const quiltsMovLoc = this.dashboardService.getQuiltMovementByLocationId(this.quiltsLocationForm.getRawValue(), this.orderTypeId, this.companies, this.location, this.startDate, this.endDate, this.orderName).subscribe((res) => {
      if (res.statusCode == 200) {
        this._items$1.next(res.data.result.quiltsDistributions);
        this.locationCustomerName = res.data.result.customerAndLocationName;
        this.locQuiltLeased = res.data.result.quiltsOnHand;
        this.length = res.data.totalCount;
        this.pageSizeOptions = [5, 10];
        if (!this.pageSizeOptions.includes(this.length)) {
          this.pageSizeOptions.push(this.length)
        }
        if (this.length < 5) {
          this.pageSizeOptions = [5, 10];
        }
        // this.getChartsData();
        // const location = res.data.result;
        // const point: google.maps.LatLngLiteral = {
        //   lat: location.latitude,
        //   lng: location.longitude,
        // };

        // this.locationCoords = new google.maps.LatLng(point);

        // this.mapCenter = new google.maps.LatLng(point);
        // this.map.panTo(point);
        // let address: string = '';

        // address = `${location.address} ${location.city}`;
        // if (location.state && location.state != '') {
        //   address = `${address} ${location.state}`;
        // }
        // if (location.country && location.country != '') {
        //   address = `${address} ${location.country}`;
        // }
        // if (location.onhand || location.onhand === 0) {
        //   address = `${address}, OnHand - ${location.onhand}`;
        // }
        // if (location.inbound || location.inbound === 0) {
        //   address = `${address}, InBound - ${location.inbound}`;
        // }
        // if (location.outbound || location.outbound === 0) {
        //   address = `${address}, OutBound - ${location.outbound}`;
        // }
        // let details = res.data.result.quiltsDistributions
        // details.forEach((detail: any) => {

        //   address = `OnHand - ${detail.onhand}, InBound - ${detail.inbound}, OutBound - ${detail.outbound}`;
        // })
        // this.address = address;
        // this.formattedAddress = address;
        // this.markerInfoContent = address;

        // this.markerOptions = {
        //   draggable: false,
        //   animation: google.maps.Animation.DROP,
        // };
        this.spinner.hide();
      }

      else {
        this.toastr.error(res.message);
      }
    })
    this.unsubscribe.push(quiltsMovLoc);
  };



  // findAddressForCustomerId(id:any) {
  //   this.dashboardService.getLocationDetailsByCustomerId(id).subscribe(
  //     response => {
  //       if (response.statusCode === 200) {
  //         const location = response.data;
  //         const point: google.maps.LatLngLiteral = {
  //           lat: location.latitude,
  //           lng: location.longitude,
  //         };

  //         this.locationCoords = new google.maps.LatLng(point);

  //         this.mapCenter = new google.maps.LatLng(point);
  //         this.map.panTo(point);
  //         let address: string = '';

  //         address = `${location.address} ${location.city}`;
  //         if (location.state && location.state != '') {
  //           address = `${address} ${location.state}`;
  //         }
  //         if (location.country && location.country != '') {
  //           address = `${address} ${location.country}`;
  //         }
  //         this.address = address;
  //         this.formattedAddress = address;
  //         this.markerInfoContent = address;

  //         this.markerOptions = {
  //           draggable: false,
  //           animation: google.maps.Animation.DROP,
  //         };
  //       } else {
  //         this.toastr.error(response.error_message, response.status);
  //       }
  //     }
  //   );
  // }

  // getTotalQuiltsData() {
  //   // this.spinner.show();
  //   const body = {
  //     ... this.formValues,
  //     companyIds: this.companyIdsArr
  //   }
  //   const totalQuilts = this.dashboardService.getTotalQuiltsChartData(body).subscribe((res) => {
  //     // this.spinner.hide();
  //     if (res.statusCode == 200) {
  //       this.quiltData = res.data;
  //       this.chartOptions.series = res.data.series;
  //       this.chartOptions.labels = res.data.labels;
  //       this.cd.detectChanges();
  //     }

  //     else {
  //       this.toastr.error(res.message);
  //     }
  //   })
  //   this.unsubscribe.push(totalQuilts);
  // };

  getTotalQuiltsData() {
    // this.spinner.show();
    let body = {
      ... this.inventoryOverviewFilterValue
    }
    body.orderTypeId = this.orderTypeId;
    let continentId = body.continentId;
    let locationId = body.locationId;
    body.continentId = [];
    body.locationId = [];
    body.customerGroupId = [];
    if (continentId && continentId != "0") {
      body.continentId = [+continentId];
    }
    if (locationId && locationId != "0") {
      body.locationId = [+locationId];
    }
    if (this.companyType != 0) {
      body.customerGroupId = [+this.companyType]
    }
    if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      body.orderNickName = this.orderName
    }
    // if ([this.roleEnum.customerAdmin].includes(this.loggedInUserRole)) {
    //   body.customerId = [+this.loggedInCustomerId]
    // }

    const totalQuilts = this.dashboardService.getInventoryOverview(body).subscribe((res) => {
      if (res.statusCode == 200) {
        this.quiltData = res.data;
        this.inventoryOverViewSeriesAll = res.data && res.data.series ? res.data.series : [];
        this.inventoryOverViewLabelsAll = res.data && res.data.labels ? res.data.labels : [];
        this.totallabelCount = res.data?.totalCount
        //this.inventoryOverViewLabels = this.inventoryOverViewLabelsAll.slice(0, 5);
        //this.inventoryOverViewSeries = this.inventoryOverViewSeriesAll.slice(0, 5);
        // this.cd.detectChanges();
      }

      else {
        this.toastr.error(res.message);
      }
    })
    // this.spinner.hide();
    this.unsubscribe.push(totalQuilts);
  };
  getUsedData() {
    // this.spinner.show();
    const body = {
      ... this.usedchartFilterValue
    }
    body.orderTypeId = this.orderTypeId;
    let continentId = body.continentId;
    let locationId = body.locationId;
    body.continentId = [];
    body.locationId = [];
    body.customerGroupId = [];
    if (continentId && continentId != "0") {
      body.continentId = [+continentId];
    }
    if (locationId && locationId != "0") {
      body.locationId = [+locationId];
    }

    if (this.companyType != 0) {
      body.customerGroupId = [+this.companyType]
    }
    // if ([this.roleEnum.customerAdmin].includes(this.loggedInUserRole)) {
    //   body.customerId = [+this.loggedInCustomerId]
    // }
    if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      body.orderNickName = this.orderName
    }
    const totalQuilts = this.dashboardService.getUsedChart(body).subscribe((res) => {
      if (res.statusCode == 200) {
        this.usedDataChart = res.data;
        this.newUsedSeries = res.data && res.data.series ? res.data.series : [];
        this.newUsedLabels = res.data && res.data.labels ? res.data.labels : [];
        // this.cd.detectChanges();
      }

      else {
        this.toastr.error(res.message);
      }
    })
    // this.spinner.hide();
    this.unsubscribe.push(totalQuilts);
  };
  usageSizeDates() {
    let date: Date = new Date();
    this.endDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
    this.startDate = moment().startOf('year').format("YYYY-MM-DD")
    this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
    this.startDateForData = moment().startOf('year').format("YYYY-MM-DD")
    this.usageBySizeFilters.controls.fromDate.patchValue(this.startDate);
    this.usageBySizeFilters.controls.toDate.patchValue(this.endDate);
    this.getUsagesSize()
  }
  getUsagesSize() {
    debugger
    // this.spinner.show();
    const body = {
      ... this.usageSizeFilterValue
    }
    body.orderTypeId = this.orderTypeId;
    let continentId = body.continentId;
    let locationId = body.locationId;
    body.continentId = [];
    body.locationId = [];
    body.customerGroupId = [];
    if (continentId && continentId != "0") {
      body.continentId = [+continentId];
    }
    if (locationId && locationId != "0") {
      body.locationId = [+locationId];
    }
    // if (this.startDate && this.endDate) {
    //   body.fromdate = this.startDate;
    //   body.toDate = this.endDate
    // }
    if (this.companyType != 0) {
      body.customerGroupId = [+this.companyType]
    }
    // if ([this.roleEnum.customerAdmin].includes(this.loggedInUserRole)) {
    //   body.customerId = [+this.loggedInCustomerId]
    // }
    if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      body.orderNickName = this.orderName
    }
    // if (this.startDat != null) {
    //   body.fromDate = [this.startDat]
    // }
    // if (this.endDat != null) {
    //   body.toDate = [this.endDat]
    // }

    const totalQuilts = this.dashboardService.getUsagesBySize(body).subscribe((res) => {
      if (res.statusCode == 200) {
        this.usageSizeDataChart = res.data;
        this.usageBySizeSeriesAll = res.data?.series;
        this.usageBySizeLabelsAll = res.data?.labels;
        this.totallabelCount = res.data?.totalCount;

        // this.usageBySizeSeries = this.usageBySizeSeriesAll.slice(0, 5);
        // this.usageBySizeLabels = this.usageBySizeLabelsAll.slice(0, 5);
        // this.cd.detectChanges();
      }

      else {
        this.toastr.error(res.message);
      }
    })
    // this.spinner.hide();
    this.unsubscribe.push(totalQuilts);
  };
  totalUsageDates() {
    let date: Date = new Date();
    this.endDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
    this.startDate = moment().startOf('year').format("YYYY-MM-DD")
    this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
    this.startDateForData = moment().startOf('year').format("YYYY-MM-DD")
    this.totalUsageFilter.controls.fromDate.patchValue(this.startDate);
    this.totalUsageFilter.controls.toDate.patchValue(this.endDate);
    this.getTotalUsage()
  }
  getTotalUsage() {
    // this.spinner.show();
    const body = {
      ... this.totalUsageFilterValue
    }
    body.orderTypeId = this.orderTypeId;
    let continentId = body.continentId;
    let locationId = body.locationId;
    body.continentId = [];
    body.locationId = [];
    body.customerGroupId = [];
    if (continentId && continentId != "0") {
      body.continentId = [+continentId];
    }
    if (locationId && locationId != "0") {
      body.locationId = [+locationId];
    }

    if (this.companyType != 0) {
      body.customerGroupId = [+this.companyType]
    }
    // if ([this.roleEnum.customerAdmin].includes(this.loggedInUserRole)) {
    //   body.customerId = [+this.loggedInCustomerId]
    // }
    if ([this.roleEnum.customerAdmin, this.roleEnum.customerManager].includes(this.loggedInUserRole)) {
      body.orderNickName = this.orderName
    }
    const totalQuilts = this.dashboardService.getTotalUsage(body).subscribe((res) => {
      if (res.statusCode == 200) {
        this.totalUsageData = res.data;
        this.totalUsageSeries = res.data && res.data.series ? res.data.series : [];
        this.totalUsageLabels = res.data && res.data.labels ? res.data.labels : [];
        // this.cd.detectChanges();
      }

      else {
        this.toastr.error(res.message);
      }
    })
    // this.spinner.hide();
    this.unsubscribe.push(totalQuilts);
  };
  getRetiredQuilts() {
    // this.spinner.show();
    const totalQuilts = this.dashboardService.getRetiredQuilts().subscribe((res) => {
      if (res.statusCode == 200) {
        this.retiredQuiltData = res.data;
        this.chartOptions4.series = res.data?.series;
        this.chartOptions4.labels = res.data?.labels;
        this.chartTotalCount = res.data?.totalCount
        if (!this.chartTotalCount) {
          this.noChart = true
        }
        // this.chartOptions4.legend.formatter(this.chartOptions4.labels, this.chartOptions4.series)
        // this.cd.detectChanges();
      }

      else {
        this.toastr.error(res.message);
      }
    })
    // this.spinner.hide();
    this.unsubscribe.push(totalQuilts);
  };

  getMapLoaction(id: any) {
    // this.spinner.show();
    const totalQuilts = this.dashboardService.getMapData(+id, +this.companyType).subscribe((res) => {
      if (res.statusCode == 200) {
        this.mapDetails = res.data;
        this.mapLocationDetails = res.data.mapLocations
        this.quiltLocationMark(res.data.mapLocations)
        // this.cd.detectChanges();
      }

      else {
        this.toastr.error(res.message);
      }
    })
    // this.spinner.hide();
    this.unsubscribe.push(totalQuilts);
  };
  dateRangee(dValue: any) {
    // this.dateRangeCustom;
    // this.chartStatus = false;
    let date: Date = new Date();

    if (dValue === "monthly") {
      this.chartStatus = false;
      this.dateRange = false;
      this.dateRangeCustom = true;
      // this.endDateForData = moment(date).format("YYYY-MM-DD");
      // this.startDateForData = moment(date.setDate(date.getDate() - 30)).format("YYYY-MM-DD");
      // this.endDat = moment(date).format("MM-DD-YYYY");
      this.endDat = moment(date.setDate(date.getDate())).format("MM-DD-YYYY");
      this.startDat = moment(date.setDate(date.getDate() - 29)).format("MM-DD-YYYY");
      this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      this.startDateForData = moment(date.setDate(date.getDate() - 29)).format("YYYY-MM-DD");
      // console.log(this.startDat, this.endDat, this.startDateForData, this.endDateForData)
      // this.quiltActivityForm.controls.startDate.patchValue(this.startDat);
      // this.quiltActivityForm.controls.endDate.patchValue(this.endDat);
      this.cd.detectChanges();
      // this.quiltActivityData();
      // this.getQuiltsMovement();
      console.log(dValue, this.startDat, this.endDat);

    }
    else if (dValue === "weekly") {
      this.chartStatus = false;
      this.dateRange = false;
      this.dateRangeCustom = true;
      // this.endDateForData = moment(date).format("YYYY-MM-DD");
      // this.startDateForData = moment(date.setDate(date.getDate() - 7)).format("YYYY-MM-DD");
      // this.endDat = moment(date).format("MM-DD-YYYY");
      this.endDat = moment(date.setDate(date.getDate())).format("MM-DD-YYYY");
      this.startDat = moment(date.setDate(date.getDate() - 6)).format("MM-DD-YYYY");
      this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      this.startDateForData = moment(date.setDate(date.getDate() - 6)).format("YYYY-MM-DD");
      // this.quiltActivityForm.controls.startDate.patchValue(this.startDat);
      // this.quiltActivityForm.controls.endDate.patchValue(this.endDat);
      this.cd.detectChanges();
      // this.quiltActivityData();
      // this.getQuiltsMovement();
    }
    else if (dValue === "quarterly") {
      this.chartStatus = false;
      this.dateRange = false;
      this.dateRangeCustom = true;
      // this.endDateForData = moment(date).format("YYYY-MM-DD");
      // this.startDateForData = moment(date.setDate(date.getDate() - 90)).format("YYYY-MM-DD");
      // this.endDat = moment(date).format("MM-DD-YYYY");
      this.endDat = moment(date.setDate(date.getDate())).format("MM-DD-YYYY");
      this.startDat = moment(date.setDate(date.getDate() - 89)).format("MM-DD-YYYY");
      this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      this.startDateForData = moment(date.setDate(date.getDate() - 89)).format("YYYY-MM-DD");
      // this.quiltActivityForm.controls.startDate.patchValue(this.startDat);
      // this.quiltActivityForm.controls.endDate.patchValue(this.endDat);
      this.cd.detectChanges();
      // this.quiltActivityData();
      // this.getQuiltsMovement();
    }
    else if (dValue === "yearly") {
      this.chartStatus = false;
      this.dateRange = false;
      this.dateRangeCustom = true;
      // this.endDateForData = moment(date).format("YYYY-MM-DD");
      // this.startDateForData = moment(date.setDate(date.getDate() - 365)).format("YYYY-MM-DD");
      // this.endDat = moment(date).format("MM-DD-YYYY");
      this.endDat = moment(date.setDate(date.getDate())).format("MM-DD-YYYY");
      this.startDat = moment(date.setDate(date.getDate() - 364)).format("MM-DD-YYYY");
      this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      this.startDateForData = moment(date.setDate(date.getDate() - 364)).format("YYYY-MM-DD");
      // this.quiltActivityForm.controls.startDate.patchValue(this.startDat);
      // this.quiltActivityForm.controls.endDate.patchValue(this.endDat);
      this.cd.detectChanges();
      // this.quiltActivityData();
      // this.getQuiltsMovement();
    }

    else if (dValue === "custom") {
      this.dateRangeCustom = false;
      this.dateRange = true;
      this.startDateForData = "";
      this.endDateForData = "";
      this.startDat = "";
      this.endDat = "";
      // this.quiltActivityForm.controls.startDate.patchValue(this.endDat);
      // this.quiltActivityForm.controls.endDate.patchValue(this.startDat);
      // this.quiltActivityForm.controls.startDate.patchValue(this.startDat);
      // this.quiltActivityForm.controls.endDate.patchValue(this.endDat);
    }

  }

  customRange() {
    // this.dateRange;
    this.dateRangeCustom = false;
  }
  public chartModal(str: string): void {
    const modalRef = this.modalService.open(ChartModalComponent, {
      size: "md",
      centered: true,
      windowClass: "modal-dialog-centered",
    })
    modalRef.componentInstance.chartVal = str;
    modalRef.componentInstance.series = (str == 'inventory') ? this.inventoryOverViewSeriesAll : this.usageBySizeSeriesAll;
    modalRef.componentInstance.labels = (str == 'inventory') ? this.inventoryOverViewLabelsAll : this.usageBySizeLabelsAll;
    // modalRef.componentInstance.chartFormGroup = (str == 'inventory') ? this.inventoryOverviewFilterValue : this.usageSizeFilterValue;
    modalRef.componentInstance.allCusRegionLocations = this.allCusRegionLocations;
    modalRef.componentInstance.sizeOrdate = (str == 'inventory') ? this.allQuiltTypes : this.datesofUsage;
    modalRef.componentInstance.usageSize = this.usageSize;
    modalRef.componentInstance.orderTypeId = this.orderTypeId;

    // modalRef.componentInstance.usageBySize = this.getTotalQuiltsData();
  };

  public openLocationMapModal(lat: any, long: any, markerData: any): void {
    const modalRef = this.modalService.open(MapLocationComponent, {
      size: "lg",
      centered: true,
      windowClass: "modal-dialog-centered",
    })
    modalRef.componentInstance.locationlat = lat;
    modalRef.componentInstance.locationlong = long;
    modalRef.componentInstance.orderTypeId = this.orderTypeId;
    modalRef.componentInstance.markerData = markerData;
  };

  public openLocationModal(): void {
    const modalRef = this.modalService.open(LocationDetailsComponent, {
      size: "md",
      centered: true,
      windowClass: "modal-dialog-centered",
    })
    modalRef.componentInstance.searchBy = this.quiltLookupForm.get("serialNumber").value;
  };

  onSearchByValueChangeOnFilter() {
    const searchByValueSub = this.quiltsMovementForm.get("searchBy").valueChanges.pipe(debounceTime(2000)).subscribe(() => {
      this.getQuiltsMovement();
    })
    this.subscriptions.push(searchByValueSub);
  }

  openThreholdModal(obj: any) {
    const modalRef = this.modalService.open(ThresholdLimitModalComponent, {
      size: "md",
      centered: true,
      windowClass: "modal-dialog-centered",
    })
    modalRef.componentInstance.thresholdQuantity = obj.thresholdQuantity
    modalRef.componentInstance.locationName = obj.locationName
    modalRef.componentInstance.partNumber = obj.partNumber
    modalRef.componentInstance.thresholdId = obj.thresholdId
    modalRef.componentInstance.customerFacingDescription = obj.customerFacingDescription
    modalRef.result.then((result) => {
      if (result.requestAccept == true || result.requestReject == true) {
        let accepted: boolean = false;
        if (result.requestAccept) { accepted = true }
        this.acceptedRequest(result.thresholdId, accepted)
      }
    }
    )
  }


  getThresholdCompare() {
    this.spinner.show();
    this.isLoading = true;

    const customerListSub = this.dashboardService.getThresholdByCustomerId(this.loggedInCustomerId).subscribe((res) => {
      this.spinner.hide();
      this.isLoading = false;
      if (res.statusCode === 200) {
        this.thresholdDetail = res.data
        if (this.thresholdDetail) {
          for (let obj of this.thresholdDetail) {
            if ((obj.thresholdValue > 0) && (obj.thresholdValue >= obj.quiltQuantity)) {
              if (!obj.isAccepted) {
                this.openThreholdModal(obj);
              } else if (obj.isProcessed) {
                this.openThreholdModal(obj);
              }
            }
          }
        }
      } else {
        this._items$.next([]);
        if (res.message) {
          this.toastr.error(res.message)
        }
      }
    })
    this.unsubscribe.push(customerListSub);

  }

  acceptedRequest(id: any, isAccepted: boolean) {
    this.spinner.show();
    const quiltsMovLoc = this.dashboardService.requestedOrder(id, isAccepted).subscribe((res) => {
      if (res.statusCode == 200) {
        console.log('mail send!');

        this.spinner.hide();
      }

      else {
        this.toastr.error(res.message);
      }
    })
    this.unsubscribe.push(quiltsMovLoc);

  }

  filterComapny(array: any[], index: number) {
    array.splice(index, 1);

    this.customerNameId.splice(index, 1)
    this.companies = this.customerNameId;
    this.quiltMovData = [];
    this.getQuiltsMovement();
    if (array.length === 0) {
      this.companies = []
      this.filteredCompany = false;
      this.getQuiltsMovement();
    }

  }

  openFilterByLocationModal() {
    const modalRef = this.modalService.open(FilterByLocationComponent, {
      size: "md",
      centered: true,
      windowClass: "modal-dialog-centered",
    })
    modalRef.result.then((result) => {
      console.log(result)
      this.filteredLocation = true;
      this.locationData = [];
      this.location = result.locationId;
      this.locationNameId = result.locationId;
      this.customerName = result.customerName;
      console.log(this.customerName);

      this.quiltsMovementForm.controls.searchBy.patchValue(result.searchBy)
      this.onSearchByValueChangeOnFilter();
      this.getQuiltsMovement();
      // }
    });

  }


  filterLocation(array: any[], index: number) {
    array.splice(index, 1);
    console.log(this.locationNameId.splice(index, 1))
    this.location = this.locationNameId;
    this.getQuiltsMovement()
    // this.locationData.forEach((item:any) =>{
    //   this.locationName.push(item.locationName)
    // })
    // console.log(this.locationName);
    // this.filteredLocation = true;
    // this.locationData = [];
    // this.location 
    // this.customerName

    //  this.getQuiltsMovement();
    //   this.quiltMovData.forEach((details: any) => {
    //   if(!details.customerName.includes(this.customerName)){
    //     this.quiltMovData = []
    //   }
    // })
    console.log(array);
    if (array.length === 0) {
      this.location = []
      this.filteredLocation = false;
      this.getQuiltsMovement();
    }

  }

  removeSelected() {
    this.isSelected = false;
    // this.contentView = "cards";
    this.customerIds = [];
    this.companies = [];
    // this.getQuiltsMovement();
  };


  particularTable(id: any, customerName: any) {
    this.filteredCompany = false;
    this.companies.push(id);
    // this.fullTableData = quilt;
    this.contentView = "fullTable";
    // this.quiltMovData = customerName;
    this.companyName = customerName;
    this.allDetailsRequired = true;
    this.isSelected = false;
    this.quiltsMovementForm.controls.pageNumber.patchValue("1");
    this.quiltsMovementForm.controls.pageSize.patchValue("10")
    this.rolePageLoad();
  };
  // hoverTop(id: any, customerName: any) {
  //   this.companies.push(id);
  //   this.companyName= customerName;
  //   this.isSelected = true;
  // };

  backToTables() {
    this.contentView = "cards";
    this.isSelected = false;
    // this.fullTableData = {};
    this.companies = [];
    this.allDetailsRequired = false;
    this.quiltsMovementForm.controls.pageNumber.patchValue("1");
    this.quiltsMovementForm.controls.pageSize.patchValue("10")
    this.rolePageLoad();
  };

  refreshData(event: any) {
    const index: number = event.index;
    this.tabIndex = index;
    this.tab = [this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole) ? Tabs1[index] : Tabs[index];
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: [this.roleEnum.consignAdmin, this.roleEnum.consignManager].includes(this.loggedInUserRole) ? Tabs1[index] : Tabs[index] }
    });
    // if ((![this.roleEnum.customerAdmin].includes(this.loggedInUserRole) && event.index === 0) ||
    //   ([this.roleEnum.customerAdmin].includes(this.loggedInUserRole) && ([1].includes(this.customerTypeId) || [3].includes(this.customerTypeId) && event.index === 0)))
    if (this.tab == "leased") {
      this.contentView = "cards";
      this.isSelected = false;
      this.companies = [];
      this.allDetailsRequired = false;
      this.totalQuiltsForm.controls.orderTypeId.patchValue(1);
      this.donutChart.controls.orderTypeId.patchValue(1);
      this.usedChart.controls.orderTypeId.patchValue(1);
      this.usageSize.controls.orderTypeId.patchValue(1);
      this.totalUsage.controls.orderTypeId.patchValue(1);
      this.orderTypeId = 1;
      this.resultType = 1;
      this.chartStatus = false;
      this.dateRange = false;
      this.dateRangeCustom = true;
      let date: Date = new Date();
      // this.endDateForData = moment(date).format("YYYY-MM-DD");
      // this.startDateForData = moment(date.setDate(date.getDate() - 30)).format("YYYY-MM-DD");
      // this.endDat = moment(date).format("MM-DD-YYYY");
      this.endDat = moment(date.setDate(date.getDate())).format("MM-DD-YYYY");
      this.startDat = moment(date.setDate(date.getDate() - 29)).format("MM-DD-YYYY");
      this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      this.startDateForData = moment(date.setDate(date.getDate() - 29)).format("YYYY-MM-DD");
      // this.quiltActivityForm.controls.startDate.patchValue(this.startDat);
      // this.quiltActivityForm.controls.endDate.patchValue(this.endDat);
      // this.rangeForm.controls.rangeOpt.patchValue(this.selectedRange);
      // this.regionSelected.controls.customerRegion.patchValue(this.regionId)
      // this.chartForm.controls.rangeOpt.patchValue(this.selectedOption);
      // this.companies=[this.loggedInCustomerId];
      // this.loggedInCustomerId;
      // if (!this.locationUserRoles.includes(this.loggedInUserRole)) {
      //   this.getTotalQuiltsData();
      //   this.getQuiltsMovement();
      // }
      // else if (this.locationUserRoles.includes(this.loggedInUserRole)) {
      //   //   this.orderTypeId = 2;
      //   this.companies = this.loggedInCustomerId;
      //   this.loggedInCustomerId;
      //   this.getQuiltsMovementByLocationId();
      // }
      this.filteredCompany = false;
      this.filteredLocation = false;
      this.location = [];
      this.collapsed = false;
      this.rolePageLoad();
      // this.quiltActivityData();
      // if(!this.locationUserRoles.includes(this.loggedInUserRole)){
      //   this.getQuiltsMovement();
      // }
      // else if(this.locationUserRoles.includes(this.loggedInUserRole)){
      //   // this.orderTypeId = 1;
      //   this.companies=this.loggedInCustomerId;
      //   this.loggedInCustomerId;
      //   this.getQuiltsMovementByLocationId();
      // }
    }
    else if (this.tab == "purchased")
    // ((![this.roleEnum.customerAdmin].includes(this.loggedInUserRole) && event.index === 1) ||
    //   ([this.roleEnum.customerAdmin].includes(this.loggedInUserRole) && ([2, 3].includes(this.customerTypeId)))) 
    {
      this.contentView = "cards";
      this.isSelected = false;
      this.companies = [];
      this.allDetailsRequired = false;
      this.totalQuiltsForm.controls.orderTypeId.patchValue(2);
      this.donutChart.controls.orderTypeId.patchValue(2);
      this.usedChart.controls.orderTypeId.patchValue(2);
      this.usageSize.controls.orderTypeId.patchValue(2);
      this.totalUsage.controls.orderTypeId.patchValue(2);
      this.orderTypeId = 2;
      this.resultType = 1;
      this.chartStatus = false;
      this.dateRange = false;
      this.dateRangeCustom = true;
      let date: Date = new Date();
      // this.endDateForData = moment(date).format("YYYY-MM-DD");
      // this.startDateForData = moment(date.setDate(date.getDate() - 30)).format("YYYY-MM-DD");
      // this.endDat = moment(date).format("MM-DD-YYYY");
      this.endDat = moment(date.setDate(date.getDate())).format("MM-DD-YYYY");
      this.startDat = moment(date.setDate(date.getDate() - 29)).format("MM-DD-YYYY");
      this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      this.startDateForData = moment(date.setDate(date.getDate() - 29)).format("YYYY-MM-DD");
      // this.quiltActivityForm.controls.startDate.patchValue(this.startDat);
      // this.quiltActivityForm.controls.endDate.patchValue(this.endDat);
      // this.rangeForm.controls.rangeOpt.patchValue(this.selectedRange);
      // this.chartForm.controls.rangeOpt.patchValue(this.selectedOption);
      // this.loggedInCustomerId;
      this.filteredCompany = false;
      this.filteredLocation = false;
      this.location = [];
      this.collapsed = false;
      this.rolePageLoad();
      // this.quiltActivityData();
      // if (!this.locationUserRoles.includes(this.loggedInUserRole)) {
      //   this.getQuiltsMovement();
      //   this.getTotalQuiltsData();
      // }
      // else if (this.locationUserRoles.includes(this.loggedInUserRole)) {
      //   //   this.orderTypeId = 2;
      //   this.companies = this.loggedInCustomerId;
      //   this.loggedInCustomerId;
      //   this.getQuiltsMovementByLocationId();
      // }

    } else {
      this.contentView = "cards";
      this.isSelected = false;
      this.companies = [];
      this.allDetailsRequired = false;
      this.totalQuiltsForm.controls.orderTypeId.patchValue(3);
      this.donutChart.controls.orderTypeId.patchValue(3);
      this.donutChart.controls.consigned.patchValue(true)
      this.usedChart.controls.orderTypeId.patchValue(3);
      this.usedChart.controls.consigned.patchValue(true)

      this.usageSize.controls.orderTypeId.patchValue(3);
      this.usageSize.controls.consigned.patchValue(true)

      this.totalUsage.controls.orderTypeId.patchValue(3);
      this.totalUsage.controls.consigned.patchValue(true)

      this.orderTypeId = 3;
      this.resultType = 1;
      this.chartStatus = false;
      this.dateRange = false;
      this.dateRangeCustom = true;
      let date: Date = new Date();
      this.endDat = moment(date.setDate(date.getDate())).format("MM-DD-YYYY");
      this.startDat = moment(date.setDate(date.getDate() - 29)).format("MM-DD-YYYY");
      this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      this.startDateForData = moment(date.setDate(date.getDate() - 29)).format("YYYY-MM-DD");
      // this.quiltActivityForm.controls.startDate.patchValue(this.startDat);
      // this.quiltActivityForm.controls.endDate.patchValue(this.endDat);
      // this.rangeForm.controls.rangeOpt.patchValue(this.selectedRange);
      this.filteredCompany = false;
      this.filteredLocation = false;
      this.location = [];
      this.collapsed = false;
      this.rolePageLoad();

    }
    this.fetchQuiltTypes();
    // this.fetchQuiltTypes();

  }

  onSearchByValueChange() {
    // const searchByValueSub = this.quiltLookupForm.get("serialNumber").valueChanges.pipe(debounceTime(1000)).subscribe(() => {
    //   this.openLocationModal();
    // })
    // this.subscriptions.push(searchByValueSub
    if (this.isPalletScan) {
      return;
    }
    this.quiltLookupForm.controls.serialNumber.value;
    this.spinner.show();
    const quiltLookup = this.dashboardService.getQuiltsLookup(this.quiltLookupForm.controls.serialNumber.value).subscribe((res) => {
      this.spinner.hide();
      if (res.statusCode == 200) {
        this.openLocationModal();
      }

      else {
        this.toastr.error(res.message);
      }
    })
    this.unsubscribe.push(quiltLookup);

  }

  // searchReset(){
  //   this.quiltLookupForm.controls.serialNumber.patchValue("");
  // }

  chartResponse(id: number) {
    this.cardClicked = id;
    this.companyIdsArr = []
    this.companyIdsArr.push(id)
    this.getTotalQuiltsData();
    this.getUsedData();
    this.getUsagesSize();
    this.getTotalUsage();
  }

  resetPageIndex() {
    this.quiltsMovementForm.controls.pageNumber.patchValue(1);
  }

  paginator(event: any) {
    this.quiltsMovementForm.controls['pageSize'].patchValue(event.pageSize);
    this.quiltsMovementForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.getQuiltsMovement();
  }

  paginatorLocation(event: any) {
    this.quiltsLocationForm.controls['pageSize'].patchValue(event.pageSize);
    this.quiltsLocationForm.controls['pageNumber'].patchValue(event.pageIndex + 1);
    this.getQuiltsMovementByLocationId();
  }

}
interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}
