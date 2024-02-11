import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { User, UserDocument } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto, UpdateProfileDto } from '../dto/CreateUser.dto';
import { hash } from 'bcrypt';
import { UpdateUserDto } from '../dto/UpdateUser.dto';
import { MongoResultQuery } from '../../../shared/mongoResult/MongoResult.query';
import { OperationResult } from '../../../shared/mongoResult/OperationResult';
import { ObjectNotFoundException } from '../../../shared/httpError/class/ObjectNotFound.exception';
import { SocialProfileV1Service } from 'src/component/social-provider/v1/social-profile-v1.service';
import { Gallery } from '../../gallery/schemas/gallery.schema';
import { GalleryV1Service } from '../../gallery/v1/gallery-v1.service';

@Injectable()
export class Userv1Service {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @Inject(forwardRef(() => SocialProfileV1Service))
        private socialService: SocialProfileV1Service,
        private galleryService: GalleryV1Service,
    ) { }

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
        let dbUser;
        // Check if user with the same email already exists
        const existingUser = await this.userModel.findOne({ email: user.email });

        if (existingUser) {
            res.data = existingUser;
            res.status = OperationResult.create;
            dbUser = existingUser;
        } else {
            if (user.password) {
                user.password = await hash(user.password, 10);
            }

            user.username = user.username.toLowerCase().split(' ').join('-');
            const newUser = await this.userModel.create(user);

            if (!newUser) {
                this.throwObjectNotFoundError();
            }

            dbUser = newUser;
        }

        const { email, profilePicture, provider, username } = user;

        if (provider) {
            const profiles = await this.socialService.getUserSocialProfiles(
                dbUser._id.toString()
            )

            await this.socialService.create({
                email,
                profilePicture,
                provider: provider === 'google' ? 'youtube' : provider,
                userId: dbUser.id,
                primary: profiles.length === 0,
                username
            })
        }

        dbUser.password = undefined;

        res.data = dbUser;
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

    async updateProfilePicture(
        userId: string,
        image: Gallery
    ): Promise<User> {
        const user = await this.userModel.findByIdAndUpdate(userId, { profilePicture: image }, {
            returnDocument: 'after'
        });

        if (!user) {
            this.throwObjectNotFoundError();
        }

        return user
    }

    async deleteProfilePicture(
        userId: string,
    ): Promise<MongoResultQuery<User>> {
        const res = new MongoResultQuery<User>();
        const user = await this.userModel.findById(userId)

        if (!user) {
            this.throwObjectNotFoundError();
        }

        if (user.profilePicture) {
            await this.galleryService.delete((user.profilePicture as any)._id)
        }

        res.data = user
        res.status = OperationResult.delete
        return res
    }

    async updateProfile(
        userId: string,
        userData: UpdateProfileDto
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

    async getByUsernameOrEmail(identifier: string): Promise<User> {
        return this.userModel
            .findOne({
                $or: [
                    { username: identifier },
                    { email: identifier }
                ]
            }, [
                'username',
                'email',
                'password',
                'type'
            ])
            .exec();
    }

    async getByEmail(email: string): Promise<User> {
        return this.userModel
            .findOne({ email }, [
                '_id',
                'name',
                'username',
                'email',
                'password',
                'type',
            ])
            .exec();
    }

    async getByResetToken(token: string): Promise<User> {
        return this.userModel
            .findOne({ token }, [
                'name',
                'token',
                'username',
                'email',
                'password',
                'type',
            ])
            .exec();
    }

    private throwObjectNotFoundError(): void {
        throw new ObjectNotFoundException(User.name);
    }
}
