import { HttpException, HttpStatus } from '@nestjs/common';

export class ObjectNotFoundException extends HttpException {
    constructor(className: string) {
        super(`${className} not found`, HttpStatus.NOT_FOUND);
    }
}

export class InvalidTokenException extends HttpException {
    constructor() {
        super(`Token is invalid or expired`, HttpStatus.NOT_FOUND);
    }
}

export class BadRequestException extends HttpException {
    constructor() {
        super(`Something went wrong!`, HttpStatus.BAD_REQUEST);
    }
}

export class RecordNotFoundException extends HttpException {
    constructor() {
        super(`Not found`, HttpStatus.NOT_FOUND);
    }
}

export class AlreadyExistException extends HttpException {
    constructor(className: string) {
        super(`${className} already exist`, HttpStatus.FORBIDDEN);
    }
}

export class VotingAbusedException extends HttpException {
    constructor() {
        super('Voting abuse detected', HttpStatus.FORBIDDEN);
    }
}
