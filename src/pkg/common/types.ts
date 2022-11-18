/* eslint-disable camelcase */
// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export interface StackFile {
  provider: Provider;
  functions: Record<string, StackFunction>;
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
  provider: Provider;
  functions: Record<string, SyncStackFunction>;
}

export interface SyncStackFunction {
  bootstrap: string;
  environment: Record<string, string>;
  secret: Record<string, string>;
}

export type ServiceStatus = 'inactive' | 'active' | 'activating' | 'failed'
export type ServiceMeta = Array<  {
  type: 'link' | 'text',
  label: string,
  value: string,
}>

export type Log = 'info'| 'warn'| 'error'
export type Logger = (type: Log, title: string, message:string) => void
export type SolutionPaths = {
  projectPath: string,
  templatesPath: string,
  solutionPath: string,
  solutionSetupJsPath: string,
  solutionRunJsPath: string,
  dotTelarDirectoryPath: string,
  telarManifestPath: string
 }
export type TelarEnvironment = 'development' | 'production'

export type MicroRun = {
  dir: string;
  name: string;
  path: string;
}
