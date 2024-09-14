import { Component, Input, OnInit, inject } from '@angular/core';
import { MenuItem } from '../../domain/menu-item';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../service/config.service';
import { catchError } from 'rxjs';
import { HandleError, HttpErrorHandler } from '../../webapi/http-error-handler.service';
import { ServiceConfig } from '../../domain/ServiceConfig';


@Component({
  selector: 'app-metro-side-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './metro-side-menu.component.html',
  styleUrl: './metro-side-menu.component.css'
})
export class MetroSideMenuComponent implements OnInit {
  private handleError!: HandleError;
  private readonly httpErrorHandler: HttpErrorHandler = inject(HttpErrorHandler);
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly configService: ConfigService = inject(ConfigService);
  @Input() menuItems: MenuItem[] = [];
  accesibleMenuItems: MenuItem[] = [];
  selectedMenuItem?: MenuItem;

  constructor() {
    this.handleError = this.httpErrorHandler.createHandleError();
  }

  ngOnInit(): void {
    let apiUrl = this.configService.environment.apiUrl.endsWith("/") ? this.configService.environment.apiUrl : this.configService.environment.apiUrl + "/";
    apiUrl += "Authentication/resources";
    this.httpClient.get<string[]>(apiUrl)
      .pipe(
        catchError(this.handleError<string[]>('get resources list')),
      )
      .subscribe((resources: string[]) => {
        if (!resources || !(resources.length > 0))
          return;
        this.accesibleMenuItems = this.menuItems;
        this.accesibleMenuItems.forEach(x => {
          x.subMenu = x.subMenu?.filter(x => !x.resource || resources.includes(x.resource));
        });
        this.accesibleMenuItems = this.menuItems.filter(x => (x.subMenu?.length ?? 0 > 0) || x.resource?.includes(x.resource));
      });
  }

  menueSelected(menuItem: MenuItem) {
    if (menuItem === this.selectedMenuItem)
      return;
    if (menuItem.subMenu?.length ?? 0 > 0)
      menuItem.isOpen = !menuItem.isOpen;
    else
      this.selectedMenuItem = menuItem;
  }
}
