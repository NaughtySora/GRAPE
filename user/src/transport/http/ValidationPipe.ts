import {
  BadRequestException,
  ValidationError, ValidationPipe
} from "@nestjs/common";

const OPTIONS = {
  whitelist: true,
  forbidNonWhitelisted: true,
  exceptionFactory: (validationErrors: ValidationError[] = []) =>
    new BadRequestException(validationErrors.map(error =>
      Object.values(error?.constraints ?? {}).join('. ')).join('. ')),
};

export default ValidationPipe.bind(ValidationPipe, OPTIONS);