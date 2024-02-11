import { ApiProperty } from '@nestjs/swagger';

export class AnalysisReportDTO {
  @ApiProperty()
  today: number;

  @ApiProperty()
  month: number;
}

export class VotingCountDTO {
  @ApiProperty()
  today: number;

  @ApiProperty()
  all: number;
}

export class VotingStatsDTO {
  @ApiProperty()
  count: number;

  @ApiProperty()
  date: string;
}
