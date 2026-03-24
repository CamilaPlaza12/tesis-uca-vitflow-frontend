import { Component, EventEmitter, HostListener, Input, Output, OnInit } from '@angular/core';
import { UserService } from '../../../service/user_service';
@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  @Input() mobileOpen = false;
  @Output() mobileOpenChange = new EventEmitter<boolean>();

  isMobile = window.innerWidth <= 900;

  data: any = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.currentUserData$.subscribe((data) => {
      this.data = data;
    });
  }

  @HostListener('window:resize')
  onResize() {
    const next = window.innerWidth <= 900;
    if (next !== this.isMobile) {
      this.isMobile = next;
      if (!this.isMobile) {
        this.closeMobile();
      } else {
        this.collapsedChange.emit(false);
      }
    }
  }

  toggleCollapse() {
    this.collapsedChange.emit(!this.collapsed);
  }

  closeMobile() {
    if (this.mobileOpen) this.mobileOpenChange.emit(false);
  }

  onNavClick() {
    if (this.isMobile) this.closeMobile();
  }

  get hospitalName(): string {
    return this.data?.hospital?.name || '';
  }

  get fullName(): string {
    const user = this.data?.user || {};
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }

  get roleLabel(): string {
    const role = this.data?.user?.role;
    return role === 'HOSPITAL_ADMIN' ? 'Administración' : 'Técnico';
  }

  get isAdmin(): boolean {
    return this.data?.user?.role === 'HOSPITAL_ADMIN';
  }
}