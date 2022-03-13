import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { hash } from 'bcrypt';
import { UpdateUserDto } from '../dto/UpdateUser.dto';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';

@Injectable()
export class Userv1Service {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) {}

    async findById(id: string): Promise<MongoResultQuery<User>> {
        const res = new MongoResultQuery<User>();

        res.data = await this.userModel.findById(id).exec();

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.fetch;

        return res;
    }

    async findByQuery(filter: any = {}): Promise<MongoResultQuery<User[]>> {
        const res = new MongoResultQuery<User[]>();

        res.data = await this.userModel.find(filter).exec();
        res.count = res.data.length;
        res.status = OperationResult.fetch;

        return res;
    }

    async createUser(user: CreateUserDto): Promise<MongoResultQuery<User>> {
        const res = new MongoResultQuery<User>();

        user.password = await hash(user.password, 10);
        const newUser = await this.userModel.create(user);

        if (!newUser) {
            this.throwObjectNotFoundError();
        }

        newUser.password = undefined;

        res.data = newUser;
        res.status = OperationResult.create;

        return res;
    }

    async updateUser(
        userId: string,
        userData: UpdateUserDto
    ): Promise<MongoResultQuery<User>> {
        const res = new MongoResultQuery<User>();

        if (userData.password) {
            userData.password = await hash(userData.password, 10);
        }

        res.data = await this.userModel.findByIdAndUpdate(userId, userData, {
            returnDocument: 'after'
        });

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.update;

        return res;
    }

    async deleteUser(id: string): Promise<MongoResultQuery<User>> {
        const res = new MongoResultQuery<User>();
        res.data = await this.userModel.findByIdAndDelete(id);

        if (!res.data) {
            this.throwObjectNotFoundError();
        }

        res.status = OperationResult.delete;

        return res;
    }

    async getByUsername(username: string): Promise<User> {
        return this.userModel
            .findOne({ username: username }, [
                'username',
                'email',
                'password',
                'type'
            ])
            .exec();
    }

    private throwObjectNotFoundError(): void {
        throw new ObjectNotFoundException(User.name);
    }
}
