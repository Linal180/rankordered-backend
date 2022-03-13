import { HttpException, HttpStatus } from '@nestjs/common';

export class ObjectNotFoundException extends HttpException {
    constructor(className) {
        super(`${className} not found`, HttpStatus.NOT_FOUND);
    }
}
