import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { GalleryV1Service } from '../../gallery/v1/gallery-v1.service';
import { OldCollege } from '../schemas/OldCollege';
import { OldCollegeImageUpload } from '../schemas/OldCollegeImageUpload';
import { ComparisonItemV1Service } from '../v1/comparison-item-v1.service';

@Processor('college_migration')
export class CollegeQueueConsumer {
    constructor(
        private service: ComparisonItemV1Service,
        private galleryService: GalleryV1Service,
        @InjectQueue('college_migration')
        private collegeMigrationQueue: Queue
    ) {}

    @Process('addCollege')
    async addCollege(job: Job<OldCollege>) {
        console.log(`Running job ${job.id} of process ${job.name}`);

        try {
            const item = await this.service.createItem({
                name: job.data.name,
                slug: this.convertToSlug(job.data.name),
                category: [
                    '62277bb44337543c47ce7668',
                    '62277bdc4337543c47ce766a'
                ],
                defaultCategory: '62277bdc4337543c47ce766a',
                address: `${job.data.city}, ${job.data.state}`,
                website: job.data.website,
                description: job.data.description,
                foundedDate: job.data.founded_date
            });

            // const item = await this.service.findBySlugWithRanking(
            //     this.convertToSlug(job.data.name)
            // );

            this.collegeMigrationQueue.add('uploadCollegeImage', {
                itemId: item.data._id,
                image: job.data.image,
                image_author: job.data.image_author,
                image_title: job.data.image_title,
                image_url: job.data.image_url,
                image_license: job.data.image_license
            });
        } catch (error) {
            console.log(error);
        }

        console.log(`job ${job.id} completed`);
    }

    @Process('uploadCollegeImage')
    async uploadCollegeImage(job: Job<OldCollegeImageUpload>) {
        console.log(`Running job ${job.id} of process ${job.name}`);

        const image = await this.galleryService.migrate({
            filename: this.getFilename(job.data.image),
            destination: 'public/upload/images',
            author: job.data.image_author,
            title: job.data.image_title,
            url: job.data.image_url,
            license: job.data.image_license
        });

        await this.service.updateItem(job.data.itemId, {
            defaultImage: image._id,
            images: [image._id]
        });

        console.log(`job ${job.id} completed`);
    }

    convertToSlug(Text: string) {
        return Text.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/ +/g, '-');
    }

    getFilename(text: string) {
        return text.substring(text.lastIndexOf('/') + 1, text.length);
    }
}
