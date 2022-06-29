import { Command, flags } from "@oclif/command";
import { proxy } from "../pkg/proxy";

export default class Proxy extends Command {
  static description = "run a proxy server";

  static examples = ["$ telar proxy -p 80 -t http://social.example.com:4000"];

  static flags = {
    // Help
    help: flags.help({ char: "h" }),
    // Income port
    port: flags.string({
      char: "p",
      default: "80",
      description: "Income port",
    }),
    target: flags.string({
      char: "t",
      default: "http://social.example.com:4000",
      description: "Proxy server target",
    }),
  };

  async run() {
    const { flags } = this.parse(Proxy);

    try {
      await proxy(flags.port, flags.target);
    } catch (error: any) {
      this.error(error.message);
    }
  }
}
