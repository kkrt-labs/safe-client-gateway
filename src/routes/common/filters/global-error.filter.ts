import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  ILoggingService,
  LoggingService,
} from '../../../logging/logging.interface';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(LoggingService) private readonly loggingService: ILoggingService,
  ) {}

  catch(exception: Error, host: ArgumentsHost): any {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.loggingService.error({
      name: exception.name,
      message: exception.message,
      stacktrace: exception.stack,
    });

    const responseBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            code: httpStatus,
            message: 'Internal server error',
          };
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
