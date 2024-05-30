type UnionRunService = `${'cmd:' | 'file:'}${string}`;
type UnionSetupService = `${'cmd:' | 'file:'}${string}`;

export interface ServiceTemplate {
  description: string;
  name: string;
  repositories: Array<{ name: string; url: string }>;
  run: UnionRunService;
  setup: UnionSetupService;
}
