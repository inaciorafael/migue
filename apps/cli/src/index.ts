#!/usr/bin/env node

import { Command } from "commander";
import { startServer } from "./server";

const program = new Command();

program
  .option("--mocks <path>", "Pasta dos mocks", '../../../mocks/mocks.json')
  .option("--backend <url>", "Backend real")
  .option("--port <number>", "Porta do servidor", "4321");

program.parse();

const opts = program.opts();

startServer(opts.mocks, opts.backend, Number(opts.port));
