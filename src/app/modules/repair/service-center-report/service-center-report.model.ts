/* ================= REQUEST ================= */

export interface ServiceCenterSummaryRequest {
  pageNumber: number;
  pageSize: number;
  startDate?: string | null;
  endDate?: string | null;
  serviceCenterLocationIds?: number[];
  sortByColumn?: string;
  sortDescendingOrder?: boolean;
  searchBy?: string;
}


/* ================= RESPONSE ROOT ================= */

export interface ServiceCenterSummaryResponse {
  locations: ServiceCenterLocationVM[];
  pagingParameters: PagingParameterValues;
}


/* ================= LOCATION ================= */

export interface ServiceCenterLocationVM {
  locationName: string;
  returned: number;
  cleaned: number;
  repaired: number;
  retired: number;
  parts: ServiceCenterPartVM[];
}


/* ================= PART ================= */

export interface ServiceCenterPartVM {
  partNumber: string;
  returned: number;
  cleaned: number;
  repaired: number;
  retired: number;
  quilts: ServiceCenterQuiltVM[];
}


/* ================= QUILT ================= */

export interface ServiceCenterQuiltVM {
  quiltId: number;
  serialNumber: string;
  receiveDate: string;
  returned: number;
  cleaned: number;
  repaired: number;
  retired: number;
}


/* ================= PAGINATION ================= */

export interface PagingParameterValues {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
