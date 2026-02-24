/* ================= REQUEST ================= */

export interface ServiceCenterIcrReportRequest {
  startReceiveDate: string | null;
  endReceiveDate: string | null;
  locationId: number;
}


/* ================= RESPONSE ROOT ================= */

export interface ServiceCenterIcrReportResponse {
  id: number;
  data: ServiceCenterIcrReportData | null;
  exception: string | null;
  errorDetails: string | null;
  hasError: boolean;
  message: string;
  statusCode: number;
  errorType: string;
}

export interface ServiceCenterIcrReportData {
  totalQuilts: number;
  totalReturned: number;
  totalCleaned: number;
  totalRepaired: number;
  totalRetired: number;
  locations: ServiceCenterLocationVM[];
}


/* ================= LOCATION ================= */

export interface ServiceCenterLocationVM {
  locationId: number;
  locationName: string;
  totalQuilts: number;
  totalReturned: number;
  totalCleaned: number;
  totalRepaired: number;
  totalRetired: number;
  partNumbers: ServiceCenterPartVM[];
}


/* ================= PART ================= */

export interface ServiceCenterPartVM {
  partNumber: string;
  totalQuilts: number;
  totalReturned: number;
  totalCleaned: number;
  totalRepaired: number;
  totalRetired: number;
  quilts: ServiceCenterQuiltVM[];
}


/* ================= QUILT ================= */

export interface ServiceCenterQuiltVM {
  quiltId: number;
  serialNumber: string;
  totalReturned: number;
  totalCleaned: number;
  totalRepaired: number;
  totalRetired: number;
  repairTypeAggregates: ServiceCenterRepairTypeAggregateVM[];
  cycles: ServiceCenterCycleVM[];
}

export interface ServiceCenterCycleVM {
  reportId: number;
  icrCycle: number;
  status: string;
  receiveDate: string;
  completionDate: string;
  lastStatusDate: string;
  returned: number;
  cleaned: number;
  repaired: number;
  retired: number;
  repairTypeAggregates: ServiceCenterRepairTypeAggregateVM[];
}

export interface ServiceCenterRepairTypeAggregateVM {
  repairType: string;
  count: number;
}
