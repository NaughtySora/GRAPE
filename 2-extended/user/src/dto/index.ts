import { Transform, Type } from "class-transformer";
import { IsInt, IsPositive, IsString, 
  Matches, MaxLength, Min, 
  registerDecorator,
  ValidationArguments,
  ValidationOptions} from "class-validator";

const WHITE_SPACES = /\s+/g;
const NAME_REGEX = /^[A-Za-z\-'""]+$/;
const UNICODE_NAME_REGEXP = /^[\p{L} \-']+$/u;
const ADDRESS_LINE = /^[A-Za-z0-9 .,\\#\-']+$/;
const ZIPCODE = /^[A-Za-z0-9 \-]+$/;
const STATE = /^[A-Za-z \-']+$/;

export const decorators = {
  State() {
    return function (target: any, property: string) {
      Matches(
        STATE,
        { message: "Invalid state" },
      )(target, property);
      MaxLength(50)(target, property);
      IsString()(target, property);
    }
  },
  Zipcode() {
    return function (target: any, property: string) {
      Matches(
        ZIPCODE,
        { message: "Invalid zipcode" },
      )(target, property);
      MaxLength(20)(target, property);
      IsString()(target, property);
    };
  },
  Address() {
    return function (target: any, property: string) {
      Matches(
        ADDRESS_LINE,
        { message: "Invalid address" }
      )(target, property);
      MaxLength(100)(target, property);
      IsString()(target, property);
    }
  },
  City() {
    return function (target: any, property: string) {
      Matches(
        UNICODE_NAME_REGEXP,
        { message: "Invalid city" },
      )(target, property);
      MaxLength(255)(target, property);
      IsString()(target, property);
    }
  },
  Country() {
    return function (target: any, property: string) {
      Matches(
        UNICODE_NAME_REGEXP,
        { message: "Invalid country" }
      )(target, property);
      MaxLength(128)(target, property);
      IsString()(target, property);
    }
  },
  Name() {
    return function (target: any, property: string) {
      Matches(
        NAME_REGEX,
        { message: "Invalid name" },
      )(target, property);
      MaxLength(50)(target, property);
      IsString()(target, property);
    }
  },
  SearchString() {
    return function (target: any, property: string) {
      IsString()(target, property)
      MaxLength(128)(target, property)
      Transform(({ value }) => typeof value === "string" ?
        value.normalize('NFKC').trim().replace(WHITE_SPACES, ' ') :
        value,
      )(target, property)
    }
  },
  Offset() {
    return function (target: any, property: string) {
      IsInt()(target, property)
      Min(0)(target, property)
      Type(() => Number)(target, property)
    }
  },
  Limit() {
    return function (target: any, property: string) {
      IsInt()(target, property)
      IsPositive()(target, property)
      Type(() => Number)(target, property)
    }
  },
};


export const PASSWORD = {
  settings: {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  },
  options: {
    message: 'Password must be at least 8 characters long and \
contain at least one uppercase letter, one lowercase letter, \
one number, and one special character.',
  },
};

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return value === args.object?.[args.constraints[0]];
        },
      },
    });
  };
}