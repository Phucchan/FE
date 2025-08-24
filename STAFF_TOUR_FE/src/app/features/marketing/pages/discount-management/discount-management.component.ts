// src/app/features/marketing/pages/discount-management/discount-management.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, PercentPipe, DatePipe } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { finalize, tap } from 'rxjs';

import { DiscountService } from '../../services/discount.service';
import {
  TourDiscountRequest,
  TourScheduleForDiscount,
  TourForDiscount,
} from '../../models/tour-discount.model';
import { Paging } from '../../../../core/models/paging.model';
import { ApiResponse } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-discount-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PercentPipe,
    DatePipe,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzInputNumberModule,
    NzDatePickerModule,
    NzPopconfirmModule,
    NzDividerModule,
    NzSpinModule,
    NzTagModule,
    NzToolTipModule,
  ],
  templateUrl: './discount-management.component.html',
})
export class DiscountManagementComponent implements OnInit {
  // Services
  private discountService = inject(DiscountService);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);

  // Tour List State
  tourData: Paging<TourForDiscount> = {
    items: [],
    page: 0,
    size: 10,
    total: 0,
  };
  isTourLoading = true;
  searchKeyword = '';
  filterHasDiscount: boolean | null = null;

  // Schedule Management Modal State
  isScheduleModalVisible = false;
  isScheduleLoading = false;
  selectedTour: TourForDiscount | null = null;
  schedules: TourScheduleForDiscount[] = [];

  // Discount Form Modal State
  isDiscountModalVisible = false;
  isDiscountModalLoading = false;
  isEditMode = false;
  selectedSchedule: TourScheduleForDiscount | null = null;
  discountForm!: FormGroup;

  ngOnInit(): void {
    this.fetchTours();
    this.initDiscountForm();
  }

  // --- Tour Management ---
  fetchTours(
    page: number = 0,
    size: number = 10,
    keyword: string = '',
    hasDiscount: boolean | null = null
  ): void {
    this.isTourLoading = true;
    this.discountService
      .getToursForDiscount(keyword, page, size, hasDiscount)
      .pipe(finalize(() => (this.isTourLoading = false)))
      .subscribe((res: ApiResponse<Paging<TourForDiscount>>) => {
        if (res.code === 200) this.tourData = res.data;
      });
  }

  onSearch(): void {
    this.fetchTours(
      0,
      this.tourData.size,
      this.searchKeyword,
      this.filterHasDiscount
    );
  }

  onPageIndexChange(page: number): void {
    this.fetchTours(
      page - 1,
      this.tourData.size,
      this.searchKeyword,
      this.filterHasDiscount
    );
  }

  // --- Schedule Management ---
  openScheduleModal(tour: TourForDiscount): void {
    this.selectedTour = tour;
    this.isScheduleModalVisible = true;
    this.fetchSchedulesForSelectedTour();
  }

  fetchSchedulesForSelectedTour(): void {
    if (!this.selectedTour) return;
    this.isScheduleLoading = true;
    this.discountService
      .getSchedulesForSelect(this.selectedTour.id)
      .pipe(
        finalize(() => (this.isScheduleLoading = false)),
        tap((res: ApiResponse<TourScheduleForDiscount[]>) => {
          if (res.code === 200) {
            this.schedules = res.data;
            // Cập nhật trạng thái của tour cha sau khi có dữ liệu lịch trình mới nhất
            this.updateTourStatusInList(res.data);
          }
        })
      )
      .subscribe(); // subscribe() trống vì logic đã được xử lý trong tap()
  }

  closeScheduleModal(): void {
    this.isScheduleModalVisible = false;
    this.selectedTour = null;
    this.schedules = [];
    // Optional: Tải lại danh sách tour khi đóng modal để đảm bảo dữ liệu luôn mới nhất
    this.onSearch();
  }

  // --- Discount Form Management ---
  private initDiscountForm(): void {
    this.discountForm = this.fb.group({
      id: [null],
      discountPercent: [
        null,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      dateRange: [null, [Validators.required]],
    });
  }

  openDiscountModal(schedule: TourScheduleForDiscount): void {
    this.selectedSchedule = schedule;
    this.isEditMode = !!schedule.discountId;
    this.discountForm.reset();

    if (
      this.isEditMode &&
      schedule.discountStartDate &&
      schedule.discountEndDate
    ) {
      this.discountForm.patchValue({
        id: schedule.discountId,
        discountPercent: schedule.discountPercent,
        dateRange: [
          new Date(schedule.discountStartDate),
          new Date(schedule.discountEndDate),
        ],
      });
    }
    this.isDiscountModalVisible = true;
  }

  closeDiscountModal(): void {
    this.isDiscountModalVisible = false;
    this.selectedSchedule = null;
  }

  handleDiscountSubmit(): void {
    if (this.discountForm.invalid) {
      Object.values(this.discountForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    this.isDiscountModalLoading = true;
    const formValue = this.discountForm.value;
    const request: TourDiscountRequest = {
      scheduleId: this.selectedSchedule!.id,
      discountPercent: formValue.discountPercent,
      startDate: formValue.dateRange[0].toISOString(),
      endDate: formValue.dateRange[1].toISOString(),
    };

    const action$ = this.isEditMode
      ? this.discountService.updateDiscount(formValue.id, request)
      : this.discountService.createDiscount(request);

    action$
      .pipe(finalize(() => (this.isDiscountModalLoading = false)))
      .subscribe({
        next: (res) => {
          if (res.code === 200) {
            this.message.success(
              this.isEditMode ? 'Cập nhật thành công!' : 'Tạo mới thành công!'
            );
            this.closeDiscountModal();
            this.fetchSchedulesForSelectedTour(); // Làm mới danh sách lịch trình (sẽ tự động cập nhật tour cha)
          } else {
            this.message.error(res.message || 'Đã có lỗi xảy ra.');
          }
        },
        error: (err) => {
          const errorMessage =
            err.error?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
          this.message.error(errorMessage);
          console.error('API Error:', err);
        },
      });
  }

  onDeleteDiscount(discountId: number): void {
    this.discountService.deleteDiscount(discountId).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.message.success('Xóa khuyến mãi thành công!');
          this.fetchSchedulesForSelectedTour(); // Làm mới danh sách lịch trình (sẽ tự động cập nhật tour cha)
        } else {
          this.message.error(res.message || 'Xóa thất bại.');
        }
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Đã có lỗi xảy ra.';
        this.message.error(errorMessage);
      },
    });
  }

  /**
   * Cập nhật trạng thái 'hasDiscount' của tour trong danh sách chính
   * dựa trên danh sách các lịch trình của nó.
   */
  private updateTourStatusInList(schedules: TourScheduleForDiscount[]): void {
    if (!this.selectedTour) return;

    // Kiểm tra xem có bất kỳ lịch trình nào có discountId không
    const hasDiscount = schedules.some((s) => s.discountId !== null);

    // Tìm tour tương ứng trong danh sách tourData và cập nhật nó
    const tourInList = this.tourData.items.find(
      (t) => t.id === this.selectedTour!.id
    );
    if (tourInList && tourInList.hasDiscount !== hasDiscount) {
      tourInList.hasDiscount = hasDiscount;
    }
  }

  disabledDate = (current: Date): boolean => {
    if (!this.selectedSchedule) {
      return false;
    }
    const departureDate = new Date(this.selectedSchedule.departureDate);
    // Disable dates before today (with a day tolerance) AND after the departure date
    return (
      (current && current.getTime() < Date.now() - 86400000) ||
      current > departureDate
    );
  };
}
