// src/app/features/marketing/services/discount.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Paging } from '../../../core/models/paging.model';
import {
  TourDiscountDTO,
  TourDiscountRequest,
  TourForDiscount,
  TourScheduleForDiscount,
} from '../models/tour-discount.model';

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/marketing/discounts`;

  //Create headers to prevent caching
  private get noCacheHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Cache-Control':
        'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      Pragma: 'no-cache',
      Expires: '0',
    });
  }

  // Lấy danh sách Tour để quản lý
  getToursForDiscount(
    keyword: string,
    page: number,
    size: number,
    hasDiscount: boolean | null
  ): Observable<ApiResponse<Paging<TourForDiscount>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (hasDiscount !== null) {
      params = params.set('hasDiscount', String(hasDiscount));
    }
    // Add no-cache headers to the request
    return this.http.get<ApiResponse<Paging<TourForDiscount>>>(
      `${this.apiUrl}/tours`,
      {
        params,
        headers: this.noCacheHeaders,
      }
    );
  }

  // Lấy chi tiết một khuyến mãi
  getDiscountById(id: number): Observable<ApiResponse<TourDiscountDTO>> {
    return this.http.get<ApiResponse<TourDiscountDTO>>(`${this.apiUrl}/${id}`, {
      headers: this.noCacheHeaders,
    });
  }

  // Tạo khuyến mãi mới (POST requests are not cached, no change needed)
  createDiscount(
    request: TourDiscountRequest
  ): Observable<ApiResponse<TourDiscountDTO>> {
    return this.http.post<ApiResponse<TourDiscountDTO>>(this.apiUrl, request);
  }

  // Cập nhật khuyến mãi (PUT requests are not cached, no change needed)
  updateDiscount(
    id: number,
    request: TourDiscountRequest
  ): Observable<ApiResponse<TourDiscountDTO>> {
    return this.http.put<ApiResponse<TourDiscountDTO>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  // Xóa khuyến mãi (DELETE requests are not cached, no change needed)
  deleteDiscount(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // API để lấy lịch trình theo Tour ID
  getSchedulesForSelect(
    tourId: number
  ): Observable<ApiResponse<TourScheduleForDiscount[]>> {
    // Add no-cache headers to the request
    return this.http.get<ApiResponse<TourScheduleForDiscount[]>>(
      `${this.apiUrl}/tours/${tourId}/schedules`,
      { headers: this.noCacheHeaders }
    );
  }
}
