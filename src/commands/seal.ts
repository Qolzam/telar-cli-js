import * as fs from "fs";
import * as path from "path";
import * as crypt from "../pkg/seal/crypt";
import { Command, flags } from "@oclif/command";
import { generateKeyPair } from "../pkg/seal/generate";
import { createYaml } from "../pkg/common/yaml";

export default class Seal extends Command {
  static description = "add a server-less target";

  static examples = [
    `  telar seal --literal db-pass=p@55w0rd
  telar seal --from-file api-key.txt
  telar seal --literal a=b --literal c=d --cert public.key --output-file secrets.yml
  telar seal --gen secret --pk-base64`,
  ];

  static flags = {
    // Help
    help: flags.help({ char: "h" }),
    // Generate key pair
    gen: flags.string({ char: "g", description: "Generate key pair" }),
    // Whether generate base64 version of private key or not
    "pk-base64": flags.boolean({
      default: false,
      description: "Whether generate base64 version of private key or not",
    }),
    // Output secret file name
    "output-file": flags.string({
      char: "o",
      default: "secrets.yml",
      description: "Output file for secrets",
    }),
    // Public key
    cert: flags.string({
      char: "c",
      default: "secret-public.key",
      description:
        "The path to the public key file. Default is secret-public.key",
    }),
    // Literal
    literal: flags.string({
      char: "l",
      multiple: true,
      description: "Secret literal key-value data",
    }),
    // From file
    "from-file": flags.string({
      char: "i",
      multiple: true,
      description: "Secret literal key-value data",
    }),
  };

  static args = [{ name: "file" }];

  async run() {
    const { flags } = this.parse(Seal);

    if (flags.gen) {
      this.log("Generate flag presented ", flags.gen);

      await generateKeyPair(flags.gen, flags["pk-base64"]);
      this.log("KeyPair files generated");
    }

    let key: string | null = null;
    try {
      key = crypt.gePublictKey(flags.cert);
    } catch (error: any) {
      this.error(error.message);
    }
    if (!key) {
      this.error("Public key is required");
    }
    let secretObj = {};
    if (flags.literal && flags.literal.length > 0) {
      flags.literal.forEach((item) => {
        const keyValue = [
          item.substr(0, item.indexOf("=")),
          item.substr(item.indexOf("=") + 1),
        ];
        secretObj = {
          ...secretObj,
          [keyValue[0]]: crypt.encrypt(keyValue[1], key!),
        };
      });
    }

    if (flags["from-file"] && flags["from-file"].length > 0) {
      flags["from-file"].forEach((item) => {
        const fileName = path.basename(item);
        secretObj = {
          ...secretObj,
          [fileName]: crypt.encrypt(
            fs.readFileSync(path.resolve(item), "utf8"),
            key!
          ),
        };
      });
    }
    if (Object.keys(secretObj).length === 0) {
      return;
    }
    createYaml(
      {
        secret: secretObj,
      },
      flags["output-file"] || "secrets.yml"
    );
  }
}
