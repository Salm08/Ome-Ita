module.exports = {
  apps: [
    {
      name: "ome-ita",
      script: "npx",
      args: "tsx server.ts",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: "3000",
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "500M",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      merge_logs: true,
    },
  ],
};
