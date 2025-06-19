import * as tools from "@bgord/tools";

type ServerType = ReturnType<typeof Bun.serve>;

export class GracefulShutdown {
  private static async shutdown(server: ServerType, callback: () => any = tools.noop) {
    server.stop();
    await callback();
    console.log("HTTP server closed");
  }

  static applyTo(server: ServerType, callback: () => any = tools.noop) {
    process.on("SIGTERM", async () => {
      console.log("SIGTERM signal received: closing HTTP server");
      await GracefulShutdown.shutdown(server, callback);
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("SIGINT signal received: closing HTTP server");
      await GracefulShutdown.shutdown(server, callback);
      process.exit(0);
    });

    process.on("unhandledRejection", async (event) => {
      console.log("UnhandledPromiseRejectionWarning received: closing HTTP server");

      console.log(JSON.stringify(event));

      await GracefulShutdown.shutdown(server, callback);
      process.exit(1);
    });
  }
}
