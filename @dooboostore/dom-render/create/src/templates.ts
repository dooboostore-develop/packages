// interface Other {
//   readonly name: string;
//   readonly value: string;
//   readonly branches?: boolean;
// }

interface BundlerTemplate {
  readonly 'browser-usage' : string | null;
  readonly 'commonjs-typescript-webpack' : string | null;
  readonly 'example' : string | null;
}

export interface TemplateOption {
  readonly name: string;
  readonly template:  BundlerTemplate;
  // readonly port: BundlerTemplate;
}

const TemplateOptions: TemplateOption[] = [
  {
    name: 'default-template',
    template: {
      'browser-usage': 'dooboostore-develop/packages/@dooboostore/dom-render/default-template/browser-usage#main',
      'commonjs-typescript-webpack': 'dooboostore-develop/packages/@dooboostore/dom-render/default-template/commonjs-typescript-webpack#main',
      'example': 'dooboostore-develop/packages/@dooboostore/dom-render/example#main'
    }
  }
];

export default TemplateOptions;
