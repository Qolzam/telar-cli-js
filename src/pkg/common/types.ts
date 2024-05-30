
// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export interface StackFile {
  functions: Record<string, StackFunction>;
  provider: Provider;
}

export interface Provider {
  name: string;
}

export interface StackFunction {
  bootstrap: string;
  environment: Record<string, string>;
  environment_file: string[];
  secret_file: string[];
}

export interface SyncStackFile {
  functions: Record<string, SyncStackFunction>;
  provider: Provider;
}

export interface SyncStackFunction {
  bootstrap: string;
  environment: Record<string, string>;
  secret: Record<string, string>;
}

export type ServiceStatus = 'activating' | 'active' | 'failed' | 'inactive'
export type ServiceMeta = Array<  {
  label: string,
  type: 'link' | 'text',
  value: string,
}>

export type Log = 'error'| 'info'| 'warn'
export type Logger = (type: Log, title: string, message:string) => void
export type SolutionPaths = {
  dotTelarDirectoryPath: string,
  projectPath: string,
  solutionPath: string,
  solutionRunJsPath: string,
  solutionSetupJsPath: string,
  telarManifestPath: string
  templatesPath: string,
 }
export type TelarEnvironment = 'development' | 'production'

export type MicroRun = {
  dir: string;
  name: string;
  path: string;
}

export type AppInfo = {
  description: string
  title: string,
}
