export const getVmScript = () => `

/**
 * A handler for income message of Telar CLI
 * @param {*} action
 */
async function processMessageHandler(action) {
  const telarBus = new TelarBus(action.__id);
  try {
    switch (action.type) {
      case "run": {
        await run(action.payload, telarBus);
        break;
      }

      case "stop": {
        if (stop) {
          stop(action.payload, telarBus);
        }

        break;
      }

      default: {
        break;
      }
    }
  } catch (error) {
    telarBus.reject(error?.message);
  }
}

// listen to message from process parent
process.on("message", processMessageHandler);

// listen to close message [SIGTERM]
process.on("SIGTERM", () => {
  if (process.send) {
    process.send({
      type: "close",
    });
  }
});

class TelarBus {
  _id = null;
  constructor(id) {
    this._id = id;
  }

  async exec(cmd, options) {
    const { exec } = await import("node:child_process");
    const childProcess = exec(cmd, options, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
      } else if (stdout) {
        console.log(stdout);
      } else if (stderr) {
        console.error(stderr);
      }
    });
    if (childProcess.stdout) {
      childProcess.stdout.on("data", (data) => {
        console.log(data);
      });
    }

    childProcess.on("error", (err) => {
      console.error("ERROR: spawn failed! (" + err + ")");
    });

    if (childProcess.stderr) {
      childProcess.stderr.on("data", (data) => {
        console.error(data);
      });
    }

    childProcess.on("exit", (code, signal) => {
      console.error("exit with code " + code + " and signal " + signal);
    });
    return childProcess;
  }

  reject(payload, meta) {
    if (process.send) {
      process.send({
        __id: this._id,
        meta,
        payload,
        type: "reject",
      });
    } else {
      console.log("Process is not ready yet.");
    }
  }

  resolve(payload, meta) {
    if (process.send) {
      process.send({
        __id: this._id,
        meta,
        payload,
        type: "resolve",
      });
    } else {
      console.log("Process is not ready yet.");
    }
  }

  send(action) {
    action.__id = this._id;
    if (process.send) {
      process.send(action);
    } else {
      console.log("Process is not ready yet.");
    }
  }
}`
