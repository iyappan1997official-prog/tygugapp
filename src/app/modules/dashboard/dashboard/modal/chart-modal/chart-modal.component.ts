import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { GeneratePdfService } from 'src/app/shared/services/generate-pdf.service';
import { DashboardService } from '../../dashboard.service';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-chart-modal',
  templateUrl: './chart-modal.component.html',
  styleUrls: ['./chart-modal.component.scss']
})
export class ChartModalComponent implements OnInit {
  chartVal: string;
  series: any;
  labels: any;
  chartOptions: any;
  title: string
  allCusRegionLocations: any[] = []
  sizeOrdate: any[] = []
  dateRange: boolean = false;
  dateRangeCustom: boolean = true;
  startDate: any;
  startDateForData: any;
  endDateForData: any;
  endDate: any;
  endDat: any;
  startDat: any;
  usageSize: FormGroup
  inventoryOverviewFilters: FormGroup;
  usageBySizeFilters: FormGroup;
  dateGroup: FormGroup;
  orderTypeId: number;

  constructor(public modal: NgbActiveModal,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dashboardService: DashboardService) {
    this.chartOptions = {
      chart: {
        type: "donut",
        width: '400px'
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
  }

  ngOnInit(): void {
    this.dateGroup = this.fb.group({
      dateId: 'thisYear'
    })
    if (this.chartVal == 'inventory') {
      this.title = ' Inventory Overview';
      this.inventoryOverviewFilters = this.fb.group({
        quiltTypeId: ["0"],
        regionId: ["0"],
        locationId: ["0"],
        orderTypeId: [this.orderTypeId],
        quiltSize: ["0"]
      });
    } else {
      this.title = 'Usage by size';
      this.usageBySizeFilters = this.fb.group({
        quiltTypeId: ["0"],
        regionId: ["0"],
        locationId: ["0"],
        orderTypeId: [this.orderTypeId],
        fromDate: null,
        toDate: null
      })
    }
  }


  dateCalc(range: number) {
    let date: Date = new Date();
    this.dateRange = false;
    this.dateRangeCustom = true;
    this.endDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
    this.startDate = moment(date.setDate(date.getDate() - range)).format("YYYY-MM-DD");
    this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
    this.startDateForData = moment(date.setDate(date.getDate() - range)).format("YYYY-MM-DD");
    this.usageBySizeFilters.controls.fromDate.patchValue(this.startDate);
    this.usageBySizeFilters.controls.toDate.patchValue(this.endDate);
  }

  dateUsage(dValue: any) {
    if (dValue === "thirtyDays") {
      this.dateCalc(29)
    }
    else if (dValue === "sixtyDays") {
      this.dateCalc(59)
    }
    else if (dValue === "ninetyDays") {
      this.dateCalc(89)
    } else if (dValue === 'thisYear') {
      let date: Date = new Date();
      this.dateRange = false;
      this.dateRangeCustom = true;
      this.endDate = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      this.startDate = moment().startOf('year').format("YYYY-MM-DD")
      this.endDateForData = moment(date.setDate(date.getDate())).format("YYYY-MM-DD");
      this.startDateForData = moment().startOf('year').format("YYYY-MM-DD")
    }
    else if (dValue === "yearly") {
      this.dateCalc(365)
    } else if (dValue === "twoyears") {
      this.dateCalc(730)
    } else if (dValue === "threeyears") {
      this.dateCalc(1095)
    }
  }

}
