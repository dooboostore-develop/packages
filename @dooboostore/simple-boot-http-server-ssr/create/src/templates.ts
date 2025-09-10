// interface Other {
//   readonly name: string;
//   readonly value: string;
//   readonly branches?: boolean;
// }

interface BundlerTemplate {
  readonly webpack: string | null;
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
      webpack: 'dooboostore-develop/packages/@dooboostore/simple-boot-http-server-ssr/default-template-webpack#main'
    }
  }
];

export default TemplateOptions;
