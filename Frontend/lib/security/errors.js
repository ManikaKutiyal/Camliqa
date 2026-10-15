import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function toErrorResponse(error, fallbackMessage = "Internal Server Error") {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json({ error: message || fallbackMessage }, { status: 500 });
}
