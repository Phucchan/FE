// src/app/features/marketing/models/tour-discount.model.ts

// Model cho Tour trong bảng chính
export interface TourForDiscount {
  id: number;
  name: string;
  tourStatus: 'PUBLISHED' | 'DRAFT' | 'CANCELED';
  hasDiscount: boolean;
}

// Model cho Lịch trình trong modal quản lý
export interface TourScheduleForDiscount {
  id: number;
  departureDate: string;
  // Các trường dưới đây có thể là null nếu chưa có khuyến mãi
  discountId: number | null;
  discountPercent: number | null;
  discountStartDate: string | null;
  discountEndDate: string | null;
}

// DTO đầy đủ, tương ứng với TourDiscountDTO từ BE
export interface TourDiscountDTO {
  id: number;
  scheduleId: number;
  tourId: number;
  tourName: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
}

// DTO để gửi đi khi tạo/cập nhật
export interface TourDiscountRequest {
  scheduleId: number;
  discountPercent: number;
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
}

// Model cho Tour trong ô select (tương ứng TourResponseManagerDTO)
export interface TourSelectItem {
  id: number;
  name: string;
}

// Model cho TourSchedule trong ô select (tương ứng TourScheduleManagerDTO)
export interface TourScheduleSelectItem {
  id: number;
  departureDate: string;
}

// Model cho TourDiscountSummaryDTO từ BE
export interface TourDiscountSummary {
  id: number;
  scheduleId: number;
  tourName: string;
  departureDate: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
}
