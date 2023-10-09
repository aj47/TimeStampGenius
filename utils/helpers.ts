//Saves logs
export function saveLog(logDump: string) {
  fetch("https://ku084c0dgg.execute-api.us-east-1.amazonaws.com/dev/saveLog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: "TimestampGenius",
      logDump: `@@ ${new Date().toISOString()} @@ \n ${logDump}`,
    }),
  });
}

export function stringifyAllErrorProperties(err: any) {
  if (!(err instanceof Error)) {
    throw new TypeError("Provided argument is not an instance of Error");
  }

  const errorInfo: any = {};

  // Get all properties (including non-enumerable ones) and copy them to errorInfo
  Object.getOwnPropertyNames(err).forEach((key) => {
    errorInfo[key] = (err as any)[key];
  });

  return JSON.stringify(errorInfo, null, 2); // Pretty-print with 2 spaces
}
