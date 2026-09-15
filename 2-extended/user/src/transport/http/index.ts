import {
  ExceptionFilter,
  INestApplication,
  NestApplicationOptions,
  NestInterceptor,
  PipeTransform
} from "@nestjs/common";
import { IEntryNestModule, NestFactory } from "@nestjs/core";

type Logger = Pick<Console, "info" | "error" | "log" | "info">;

export class NestHttpServer {
  private instance: INestApplication<any>;
  private status = 0;
  private console: Logger = console;
  private tag = 'Nestjs';

  constructor(
    private readonly AppModule: IEntryNestModule,
    private readonly options?: NestApplicationOptions
  ) {
    const { promise, reject, resolve } = Promise.withResolvers();
    NestFactory.create(this.AppModule, this.options)
      .then(instance => {
        this.instance = instance;
        resolve(this);
      }, reject);
    //@ts-ignore
    return promise;
  }

  name(value: string) {
    this.tag = value;
    return this;
  }

  async start(port: number) {
    await this.instance.listen(port);
    this.console.log(`${this.tag} http server started on port ${port}`);
    this.status = 1;
  }

  pipe(value: PipeTransform) {
    this.instance.useGlobalPipes(value);
    return this;
  }

  filter(value: ExceptionFilter) {
    this.instance.useGlobalFilters(value);
    return this;
  }

  interceptor(value: NestInterceptor) {
    this.instance.useGlobalInterceptors(value);
    return this;
  }

  setGlobalPrefix(value: string) {
    this.instance.setGlobalPrefix(value);
    return this;
  }

  logger(value: Logger) {
    this.console = value;
    return this;
  }

  use(plugin: any) {
    this.instance.use(plugin);
    return this;
  }

  async stop() {
    if (this.status !== 1 || this.instance === null) return;
    this.status = 2;
    this.console.info(`${this.tag} http server is stopping...`);
    await this.instance.close();
    this.console.log(`${this.tag} http server is stopped`);
    this.status = 0;
  }

  get closing() {
    return this.status === 2;
  }

  get active() {
    return this.status === 1
  }

  get inactive() {
    return this.status === 0;
  }
}

