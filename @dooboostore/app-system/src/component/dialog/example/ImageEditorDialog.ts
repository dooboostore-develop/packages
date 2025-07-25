// import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
// import template from './imageEditorDialog.html'
// import styles from './imageEditorDialog.css'
// import { ComponentBase } from '@dooboostore/app-system/component/ComponentBase';
// import { AuthStore } from '@src/store/AuthStore';
// import { OnCreateRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender';
// import { OnDestroyRender, OnDestroyRenderParams } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
// import { Subscription } from '@dooboostore/core/message';
// import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
// import { AuthService } from '@src/service/AuthService';
// import { UserService } from '@src/service/UserService';
// import { ObjetService } from '@src/service/ObjetService';
// import { Talks } from '@src/entities/Talks';
// import { TalkService } from '@src/service/TalkService';
// import { ItemService } from '@src/service/ItemService';
// import { SimFrontOption } from '@dooboostore/simple-boot-front/option/SimFrontOption';
// import { DomRenderNoProxy } from '@dooboostore/dom-render/decorators/DomRenderNoProxy';
// import { Appender } from '@dooboostore/dom-render/operators/Appender';
// import { ConvertUtils as WebConvertUtils } from '@dooboostore/core-web/convert/ConvertUtils';
// import { WorldService } from '@src/service/WorldService';
// import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
// import { Router } from '@dooboostore/dom-render/routers/Router';
//
// export type ImageEditorDialogData = {}
//
// export type Attribute = {
//   show?: null,
//   data: ImageEditorDialogData,
//   close: () => void,
// };
//
// @Component({
//   template,
//   styles,
//   selector: 'ImageEditorDialog'
// })
// export class ImageEditorDialog extends ComponentBase<Attribute> implements OnCreateRender, OnDestroyRender {
//   private formElement?: HTMLFormElement;
//   private dialogElement?: HTMLDialogElement;
//   private open = false;
//
//   constructor(
//     private simConfig: SimFrontOption,
//     private authStore: AuthStore,
//     @Inject({symbol: UserService.SYMBOL}) private userService: UserService,
//     @Inject({symbol: TalkService.SYMBOL}) private talkService: TalkService,
//     @Inject({symbol: ItemService.SYMBOL}) private itemService: ItemService,
//     @Inject({symbol: ObjetService.SYMBOL}) private objetService: ObjetService,
//     @Inject({symbol: WorldService.SYMBOL}) private worldService: WorldService,
//     @Inject({symbol: AuthService.SYMBOL}) private authService: AuthService,
//     private router: Router
//   ) {
//     super();
//   }
//
//   onInitDialog(element: HTMLDialogElement) {
//     this.dialogElement = element;
//     // console.log('----------onInitDialog------', this.dialogElement, this.dialogElement.isConnected, this.hasAttribute('show'))
//     if (this.hasAttribute('show')) {
//       this.dialogElement.showModal();
//     }
//     this.open = this.dialogElement.open;
//   }
//
//   onCreateRender(...param: any[]): void {
//   }
//
//   async onProfileImageChange(event: Event) {
//     const fileInputElement = event.currentTarget as HTMLInputElement;
//     const files = fileInputElement.files;
//     if (files && files.length) {
//       const file = files[0];
//       if (file.size > 0) {
//         await this.worldService.setWorld({
//           profile:await WebConvertUtils.toBase64(this.compressImage(file), {type: file.type, quality: 0.2})
//         });
//         this.authStore.refresh();
//       }
//     }
//   }
//
//
//   async formSubmit(form: HTMLFormElement, event: SubmitEvent) {
//     event.preventDefault();
//   }
//
//   compressImage(file: File) {
//     return WebConvertUtils.compressImage(file, {maxWidth: 100})
//   }
//
//   destroyDialog() {
//     this.formElement?.reset();
//     this.attribute?.close?.();
//   }
//
//
//   // form
//   onInitFrom(element: HTMLFormElement) {
//     this.formElement = element;
//   }
//
//
//   closeDialog() {
//     if (this.dialogElement) {
//       this.dialogElement.close();
//       this.open = this.dialogElement.open;
//     }
//   }
//
//
//   onDestroyRender(data: OnDestroyRenderParams) {
//   }
//
//
// }