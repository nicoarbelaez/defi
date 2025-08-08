import morgan from "morgan";
import chalk from "chalk";

const getTimestamp = () => {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Santiago",
  }).format(new Date());
};

// Formato personalizado para morgan
morgan.token("custom-date", () => getTimestamp());

const morganMiddleware = morgan((tokens, req, res) => {
    const ms = parseFloat(tokens["response-time"](req, res));
    const msStr = `${ms.toFixed(2)} ms`;
    const sStr = `${(ms / 1000).toFixed(3)} s`;
    return [
        chalk.blue(`[${tokens["custom-date"](req, res)}]`),
        chalk.green.bold(tokens.method(req, res)),
        chalk.yellow(tokens.url(req, res)),
        chalk.magenta(tokens.status(req, res)),
        chalk.red(`${msStr} (${sStr})`),
    ].join(" ");
});

export { morganMiddleware };
