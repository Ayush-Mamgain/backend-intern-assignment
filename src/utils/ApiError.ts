// A small custom error class so every part of the app can throw an error
// that already knows which HTTP status code it should produce.

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}
