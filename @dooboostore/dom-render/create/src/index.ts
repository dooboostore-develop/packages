import {Command, flags} from '@oclif/command';
import chalk from 'chalk';
import {cli} from 'cli-ux';
import {spawn} from 'child_process';
import inquirer from 'inquirer';
import {performance} from 'perf_hooks';
import templateOptions, {TemplateOption} from './templates';
import pEvent from 'p-event';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const degit = require('degit'); // Using require because degit doesn't have types

class CreateSvelteCmd extends Command {
  public static readonly description = 'Create a Svelte or Sapper app in a single command.';

  public static readonly flags: flags.Input<any> = {
    help: flags.help({char: 'h'}),
    version: flags.version({char: 'v'})
  };

  public static readonly args: any[] = [{name: 'file'}];

  public async run(): Promise<any> {
    const {args} = this.parse(CreateSvelteCmd);
    let {file: projectName} = args;
    if (!projectName) {
      const resp = await inquirer.prompt([
        {
          message: 'Enter project name:',
          name: 'name',
          type: 'input',
          validate: (n: any) => n !== ''
        }
      ]);
      projectName = (resp as any).name;
    }

    let response: any = await inquirer.prompt([
      {
        choices: templateOptions.filter(({name}) => ({name})),
        message: 'Select application type:',
        name: 'projectType',
        type: 'list'
      }
    ]);
    const {projectType} = response;

    const templateOption = templateOptions.find((o: TemplateOption) => o.name === projectType) as TemplateOption;
    const {template: templates} = templateOption;
    let templateUrl: string = '';
    // let port: string = '';

    const choices = ['browser-usage','commonjs-typescript-webpack', 'example'];
    // const choices = ['parcel', 'rollup'];
    // if (templates.other) templates.other.forEach((item) => choices.push(item.name));
    response = await inquirer.prompt([
      {
        choices: choices,
        message: 'Select template:',
        name: 'template',
        type: 'list'
      }
    ]);
    const {template} = response;
    // if (template === 'parcel') {
    //   templateUrl = templates.parcel as string;
    //   port = typeof ports == 'string' ? ports as string : (ports as any).parcel;
    // } else
    if (template === 'browser-usage') {
      templateUrl = templates['browser-usage'] as string;
    } else if (template === 'commonjs-typescript-webpack'){
      templateUrl = templates['commonjs-typescript-webpack'] as string;
    }else if (template === 'example'){
      templateUrl = templates['example'] as string;
    }
    // if (template === 'rollup_introduction_template') {
    //   templateUrl = templates.rollup_introduction_template as string;
    // }

    cli.action.start(`Great choice! Generating your ${projectType} app`);
    const wait = () => new Promise((resolve) => setTimeout(resolve, 500));
    await wait();
    const startTime = performance.now();
    const emitter = degit(templateUrl, {
      cache: false,
      force: true,
      verbose: true
    });
    emitter.on('info', (info: any) => {
      console.log(chalk.blue(info.message));
    });
    try {
      await emitter.clone(projectName);
    } catch (err) {
      // this.error(chalk.yellow('Something went wrong, try again! ') + chalk.red(err));
      process.exit(1);
    }

    cli.action.start(`Updating package.json name to '${projectName}'`);
    try {
      console.log('--- Cloned directory contents ---');
      console.log(readdirSync(projectName));
      console.log('---------------------------------');
      const pkgPath = join(projectName, 'package.json');
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      pkg.name = projectName;
      if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach(dep => {
          if (pkg.dependencies[dep] === 'workspace:*') {
            pkg.dependencies[dep] = 'latest';
          }
        });
      }
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      cli.action.stop('✔ Done');
    } catch (err) {
      cli.action.stop('failed');
      console.error(err);
      this.error(chalk.red(`Failed to modify package.json for ${projectName}`));
      process.exit(1);
    }

    const endTime = performance.now();
    const timeLapsed = Math.floor(endTime - startTime);
    cli.action.stop(chalk.green(`\n\n ✔ Done in ${timeLapsed}ms\n`));
    console.log(chalk.white('Installing dependencies...\n\n'));
    await wait();
    const pwd = process.cwd();
    process.chdir(projectName);
    const proc = spawn('npm', ['i']);
    proc.stdout.setEncoding('utf8');
    proc.stderr.setEncoding('utf8');
    proc.stdout.on('data', console.log);
    proc.stderr.on('data', console.error);
    const code = (await pEvent(proc, 'close')) as number;
    process.chdir(pwd);
    if (code !== 0) {
      this.error(chalk.yellow('Error: ') + chalk.red('Could not install dependencies. Check output for more info'));
    }
    console.log(chalk.green('\n\n🚀  Your new app is ready to go!\n'));
    console.log(chalk.white('Next Steps:\n'));
    console.log(chalk.cyan(`cd ${projectName}\n`));
    console.log(chalk.cyan('npm start\n'));
    // if (port !== '') {
    //   console.log(chalk.cyan(`npm run serve\n`));
    //   console.log(chalk.white(`Visit ${chalk.cyan(`http://localhost:${port}`)} in your browser.\n`));
    // } else {
    //   console.log(chalk.cyan(`npm run build\n`));
    //   console.log(chalk.white(`The app should open on your device.\n`));
    // }
  }
}

export = CreateSvelteCmd;
