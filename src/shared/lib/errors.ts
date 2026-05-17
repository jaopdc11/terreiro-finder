type ErrorOptions = { cause?: unknown };

abstract class CodedError extends Error {
  readonly code: string;

  constructor(code: string, message: string, options?: ErrorOptions) {
    super(message, options as { cause?: unknown });
    this.code = code;
    this.name = new.target.name;
  }
}

export class RepositoryError extends CodedError {}
export class ServiceError extends CodedError {}
export class DomainError extends CodedError {}
