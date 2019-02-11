//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
//++

import {Directive, ElementRef, Input, OnDestroy} from '@angular/core';
import {I18nService} from 'core-app/modules/common/i18n/i18n.service';
import {AuthorisationService} from 'core-app/modules/common/model-auth/model-auth.service';
import {OpContextMenuTrigger} from 'core-components/op-context-menu/handlers/op-context-menu-trigger.directive';
import {OPContextMenuService} from 'core-components/op-context-menu/op-context-menu.service';
import {States} from 'core-components/states.service';
import {WorkPackagesListService} from 'core-components/wp-list/wp-list.service';
import {componentDestroyed} from 'ng2-rx-componentdestroyed';
import {takeUntil} from 'rxjs/operators';
import {QueryFormResource} from 'core-app/modules/hal/resources/query-form-resource';
import {QueryResource} from 'core-app/modules/hal/resources/query-resource';
import {OpModalService} from "core-components/op-modals/op-modal.service";
import {WpTableExportModal} from "core-components/modals/export-modal/wp-table-export.modal";
import {SaveQueryModal} from "core-components/modals/save-modal/save-query.modal";
import {QuerySharingModal} from "core-components/modals/share-modal/query-sharing.modal";
import {WpTableConfigurationModalComponent} from 'core-components/wp-table/configuration-modal/wp-table-configuration.modal';
import {
  selectableTitleIdentifier,
  triggerEditingEvent
} from "core-components/wp-query-select/wp-query-selectable-title.component";
import {TableState} from "core-components/wp-table/table-state/table-state";
import {Board} from "core-app/modules/boards/board/board";
import {BoardConfigurationModal} from "core-app/modules/boards/board/configuration-modal/board-configuration.modal";
import {BoardService} from "core-app/modules/boards/board/board.service";
import {StateService} from "@uirouter/core";
import {NotificationsService} from "core-app/modules/common/notifications/notifications.service";
import {BoardCacheService} from "core-app/modules/boards/board/board-cache.service";

@Directive({
  selector: '[boardsToolbarMenu]'
})
export class BoardsToolbarMenuDirective extends OpContextMenuTrigger implements OnDestroy {
  @Input('boardsToolbarMenu-resource') public board:Board;

  public text = {
    deleteSuccessful: this.I18n.t('js.notice_successful_delete'),
  };

  constructor(readonly elementRef:ElementRef,
              readonly opContextMenu:OPContextMenuService,
              readonly opModalService:OpModalService,
              readonly boardService:BoardService,
              readonly BoardCache:BoardCacheService,
              readonly Notifications:NotificationsService,
              readonly State:StateService,
              readonly I18n:I18nService) {

    super(elementRef, opContextMenu);
  }

  ngOnDestroy():void {
    // Nothing to do
  }

  public get locals() {
    return {
      contextMenuId: 'boardsToolbarMenu',
      items: this.items
    };
  }

  protected open(evt:JQueryEventObject) {
    this.buildItems();
    this.opContextMenu.show(this, evt);
  }

  private buildItems() {
    this.items = [
      {
        // Configuration modal
        disabled: false,
        linkText: this.I18n.t('js.toolbar.settings.configure_view'),
        icon: 'icon-settings',
        onClick: ($event:JQueryEventObject) => {
          this.opContextMenu.close();
          this.opModalService.show(BoardConfigurationModal, { board: this.board });

          return true;
        }
      },
      {
        // Rename query shortcut
        disabled: !this.board.grid.updateImmediately,
        linkText: this.I18n.t('js.toolbar.settings.page_settings'),
        icon: 'icon-edit',
        onClick: ($event:JQueryEventObject) => {
          if (!!this.board.grid.updateImmediately) {
            jQuery('.board--editable-toolbar').val('').trigger('focus');
          }

          return true;
        }
      },
      {
        // Delete query
        disabled: !this.board.grid.delete,
        linkText: this.I18n.t('js.toolbar.settings.delete'),
        icon: 'icon-delete',
        onClick: ($event:JQueryEventObject) => {
          if (this.board.grid.delete &&
            window.confirm(this.I18n.t('js.text_query_destroy_confirmation'))) {
            this.boardService
              .delete(this.board)
              .then(() => {
                this.BoardCache.clearSome(this.board.id);
                this.State.go('^');
                this.Notifications.addSuccess(this.text.deleteSuccessful);
              });
          }

          return true;
        }
      }
    ];
  }
}
