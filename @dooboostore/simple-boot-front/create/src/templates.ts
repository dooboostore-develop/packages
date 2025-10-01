// interface Other {
//   readonly name: string;
//   readonly value: string;
//   readonly branches?: boolean;
// }

interface BundlerTemplate {
  readonly 'browser-usage' : string | null;
  readonly 'commonjs-typescript-webpack' : string | null;
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
      'browser-usage': 'dooboostore-develop/packages/@dooboostore/simple-boot-front/default-template/browser-usage#main',
      'commonjs-typescript-webpack': 'dooboostore-develop/packages/@dooboostore/simple-boot-front/default-template/commonjs-typescript-webpack#main'
    }
  }
];

export default TemplateOptions;
