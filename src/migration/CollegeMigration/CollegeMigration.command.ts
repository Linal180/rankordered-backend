/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Command, CommandRunner } from 'nest-commander';
import { lastValueFrom, take } from 'rxjs';
import { OldCollege } from '../../component/comparisonItem/schemas/OldCollege';

@Command({ name: 'migrate_college' })
export class CollegeMigrationRunner implements CommandRunner {
    constructor(
        private httpService: HttpService,
        @InjectQueue('college_migration')
        private collegeMigrationQueue: Queue
    ) {}

    async run(): Promise<void> {
        let res;
        let totalPage: number;
        let currentPage = 1;
        let url: string;

        console.log('migration started');

        do {
            url = `https://stgapi.rankordered.com/api/v1/colleges?page=${currentPage}`;

            res = await lastValueFrom(this.httpService.get(url).pipe(take(1)));

            res.data.items.forEach(async (item: OldCollege) => {
                await this.collegeMigrationQueue.add('addCollege', item);
            });

            totalPage = res.data.meta.totalPages;
            currentPage++;
        } while (currentPage <= totalPage);

        console.log('Migration Done');
    }
}
