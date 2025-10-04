import * as node_os from 'node:os';

import * as node_fs from 'node:fs';
import * as node_path from 'node:path';
import { MakeDirectoryOptions, RmDirOptions, RmOptions, WriteFileOptions } from 'fs';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';

export namespace FileUtils {
  export type PathParamType = string | string[];


  export class File {
    public size: number | undefined;

    constructor(private _data: {
      path: string,
      originalName?: string,
    }) {

      this.updateStats();
    }

    get originalName(): string | undefined {
      return this._data.originalName;
    }

    get directory(): string {
      return this._data.path.substring(0, this._data.path.lastIndexOf('/'));
    }

    get fileName(): string {
      return this._data.path.substring(this._data.path.lastIndexOf('/') + 1);
    }

    get path(): string {
      return this._data.path;
    }

    get extension(): string | undefined {
      const ext = this._data.path.substring(this._data.path.lastIndexOf('.') + 1);
      return ext.length > 0 ? ext : undefined;
    }

    async updateStats(): Promise<void> {
      const stats = await node_fs.promises.stat(this._data.path);
      this.size = stats.size;
    }

    async delete(): Promise<void> {
      await node_fs.promises.unlink(this._data.path);
      this._data.path = '';
      this.size = undefined;
    }


    async copy(newPath: string): Promise<void> {
      await node_fs.promises.copyFile(this._data.path, newPath);
      this._data.path = newPath;
      this.size = (await node_fs.promises.stat(newPath)).size;
    }

    // path에 파일명도있어야된다!!
    async move(newPath: string): Promise<void> {
      // newPath의 디렉토리가 없으면 생성
      const dir = newPath.substring(0, newPath.lastIndexOf('/'));
      await node_fs.promises.mkdir(dir, {recursive: true});
      await node_fs.promises.rename(this._data.path, newPath);
      this._data.path = newPath;
      this.size = (await node_fs.promises.stat(newPath)).size;
    }

    async rename(newName: string): Promise<void> {
      const dir = this.directory;
      const newPath = `${dir}/${newName}`;
      await node_fs.promises.rename(this._data.path, newPath);
      this.size = (await node_fs.promises.stat(newPath)).size;
      this._data.path = newPath;
    }
  }

  export const writeFile = async (buffer: Buffer, config: { path?: string, originalName?: string }) => {
    config.path ??= `${node_os.tmpdir()}/${RandomUtils.uuid4()}_${Date.now()}`;
    await node_fs.promises.mkdir(config.path.substring(0, config.path.lastIndexOf('/')), {recursive: true});
    await node_fs.promises.writeFile(config.path, buffer);
    return new File({path: config.path, originalName: config.originalName});
    // console.log(`파일 저장 완료: ${tempFilePath}`);
  }




  export const path = (path: PathParamType) => {
    return Array.isArray(path) ? node_path.join(...path) : path;
  }

  export const existsSync = (path: PathParamType, config?: {  existes?: (path: string) => void, noExistes?: (path: string) => void }) => {
    const p = FileUtils.path(path);
    if (node_fs.existsSync(p)) {
      config?.existes?.(p);
      return true;
    } else {
      config?.noExistes?.(p);
      return false;
    }
  }

  export const mkdirSync = (path: PathParamType, config?: MakeDirectoryOptions) => {
    FileUtils.existsSync(
      path,
      {
      noExistes: (path) => {
        node_fs.mkdirSync(path, config);
      }
    });

  }

  export const mkdir = async (path: PathParamType, config?: MakeDirectoryOptions): Promise<string> => {
    return new Promise((resolve, reject) => {
      FileUtils.existsSync(
        path,
        {
        noExistes: (path) => {
          node_fs.mkdirSync(path, config);
          resolve(path);
        },
        existes: (path) => {
          resolve(path);
        }
      });
    });
  }

  export const readSync = (path: PathParamType, config?: {  option?: Parameters<typeof node_fs['readFileSync']>[1] })  => {
    const p = FileUtils.path(path)
    const buffer = config?.option ? node_fs.readFileSync(p, config.option) : node_fs.readFileSync(p);
    // const buffer = node_fs.readFileSync(p);
    return buffer;
  }

  export const readAsync = async (path: PathParamType, config?: {  option?: Parameters<typeof node_fs.promises.readFile>[1] }) => {
    const p = FileUtils.path(path);
    return node_fs.promises.readFile(p, config?.option);
  }

  export const readStringSync = (path: PathParamType): string  => {
    const p = FileUtils.path(path);
    return node_fs.readFileSync(p, 'utf-8');
  }

  export const readStringAsync = async (path: PathParamType): Promise<string>  => {
    const p = FileUtils.path(path);
    return node_fs.promises.readFile(p, 'utf-8');
  }

  export const read = async (path: PathParamType, config: {  option: Parameters<typeof node_fs['readFile']>[1] }) => {
    const p = FileUtils.path(path);
    return node_fs.readFile(p, config.option);
  }

  export const write = (data: string | Buffer, config: {path: PathParamType, options?: WriteFileOptions,}) => {
    const p = FileUtils.path(config.path);
    config.options ? node_fs.writeFileSync(p, data, config.options) : node_fs.writeFileSync(p, data);
    return p;
  }

  export const writeAppend = (data: string | Buffer, config: {path: PathParamType, options?: WriteFileOptions}) => {
    const p = FileUtils.path(config.path);
    config.options ? node_fs.appendFileSync(p, data, config.options) : node_fs.appendFileSync(p, data);
    return p;
  }

  export const deleteSync = (path: PathParamType, config?: {options?: RmOptions}) => {
    const p = FileUtils.path(path);
    if (FileUtils.existsSync(p)) {
      config?.options ? node_fs.rmSync(p, config?.options) :  node_fs.rmSync(p);
    }
  }

  export const deleteDirSync = (path: PathParamType, config?: {options?: RmDirOptions}) => {
    const p = FileUtils.path(path);
    if (FileUtils.existsSync(p)) {
      config?.options ? node_fs.rmdirSync(p, config?.options) : node_fs.rmdirSync(p);
    }
  }
  export const deleteFileSync = (path: PathParamType) => {
    const p = FileUtils.path(path);
    if (FileUtils.existsSync(p)) {
      node_fs.unlinkSync(p);
    }
  }


  export const copySync = (source: PathParamType, destination: PathParamType, options?: Parameters<typeof node_fs.cpSync>[2]) => {
    const srcPath = FileUtils.path(source);
    const destPath = FileUtils.path(destination);
    node_fs.cpSync(srcPath, destPath, options);
  }

}