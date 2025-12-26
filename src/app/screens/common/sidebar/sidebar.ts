import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  @Input() mobileOpen = false;
  @Output() mobileOpenChange = new EventEmitter<boolean>();

  isMobile = window.innerWidth <= 900;

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
}
