import { elementDefine } from '../decorators/elementDefine';

@elementDefine({ name: 'swc-loading', extends: 'template' })
export class SwcLoading extends HTMLTemplateElement {}

@elementDefine({ name: 'swc-error', extends: 'template' })
export class SwcError extends HTMLTemplateElement {}

@elementDefine({ name: 'swc-success', extends: 'template' })
export class SwcSuccess extends HTMLTemplateElement {}

@elementDefine({ name: 'swc-when', extends: 'template' })
export class SwcWhen extends HTMLTemplateElement {}

@elementDefine({ name: 'swc-otherwise', extends: 'template' })
export class SwcOtherwise extends HTMLTemplateElement {}

@elementDefine({ name: 'swc-default', extends: 'template' })
export class SwcDefault extends HTMLTemplateElement {}
