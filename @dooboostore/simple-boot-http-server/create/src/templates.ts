// interface Other {
//   readonly name: string;
//   readonly value: string;
//   readonly branches?: boolean;
// }

interface BundlerTemplate {
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
      'commonjs-typescript-webpack': 'dooboostore-develop/packages/@dooboostore/simple-boot-http-server/default-template/commonjs-typescript-webpack#main'
    }
  }
];

export default TemplateOptions;
