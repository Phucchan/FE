/*
 * FILE: src/app/features/admin/list-customer/list-customer.component.ts
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AdminService } from '../../services/admin.service';
import { UserFullInformation } from '../../models/user.model';
import { Paging } from '../../../../core/models/paging.model';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { StatusVietnamesePipe } from '../../../../shared/pipes/status-vietnamese.pipe';

@Component({
  selector: 'app-list-customer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    AvatarComponent,
    PaginationComponent,
    StatusVietnamesePipe,
    NzTableModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzEmptyModule,
    NzSpinModule,
    NzPopconfirmModule,
  ],
  templateUrl: './list-customer.component.html',
})
export class ListCustomerComponent implements OnInit {
  customers: UserFullInformation[] = [];
  paging: Paging<UserFullInformation> | null = null;
  isLoading = true;
  keyword = '';

  private searchSubject = new Subject<string>();

  constructor(
    private adminService: AdminService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();

    // Lắng nghe sự kiện tìm kiếm
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.loadCustomers(1, searchValue);
      });
  }

  loadCustomers(page: number = 1, search: string | null = null): void {
    this.isLoading = true;
    const currentPage = page - 1; // API tính page từ 0
    const currentSearch = search === null ? this.keyword : search;

    this.adminService
      .getCustomers(currentPage, this.paging?.size ?? 10, currentSearch)
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.customers = response.data.items;
            this.paging = response.data;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load customers', err);
          this.isLoading = false;
          this.message.error('Tải danh sách khách hàng thất bại!');
        },
      });
  }

  onPageChange(page: number): void {
    this.loadCustomers(page);
  }

  onSearchChange(value: string): void {
    this.keyword = value;
    this.searchSubject.next(value);
  }

  getStatusColor(deleted: boolean): string {
    return deleted ? 'red' : 'green';
  }

  toggleStatus(customer: UserFullInformation): void {
    const action = customer.deleted ? 'Mở khóa' : 'Khóa';
    const newStatus = customer.deleted ? 'ACTIVE' : 'INACTIVE';

    this.adminService.changeUserStatus(customer.id, { newStatus }).subscribe({
      next: () => {
        this.message.success(`${action} tài khoản thành công!`);
        customer.deleted = !customer.deleted;
      },
      error: (err) => {
        console.error(
          `Failed to change status for customer ${customer.id}`,
          err
        );
        this.message.error(
          `Đã có lỗi xảy ra, không thể ${action.toLowerCase()} tài khoản.`
        );
      },
    });
  }
}
