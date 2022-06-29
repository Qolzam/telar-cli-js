import { Command, flags } from "@oclif/command";
import { sync } from "../pkg/sync";

export default class Sync extends Command {
  static description = "sync @telar/core project with target platform";

  static examples = ["$ telar sync vercel"];

  static flags = {
    // Help
    help: flags.help({ char: "h" }),
    // Stack file path
    file: flags.string({
      char: "f",
      default: "stack.yml",
      description: "Stack file path",
    }),
  };

  static args = [{ name: "target" }];

  async run() {
    const { args, flags } = this.parse(Sync);

    if (args.target) {
      this.log(`Platform target is ${args.target}`);
      try {
        await sync(args.target, flags.file!);
      } catch (error: any) {
        this.error(error.message);
      }
    }
  }
}
