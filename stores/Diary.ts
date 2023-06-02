import { IPlaceData } from './Place';
import { IStayData } from './Stay';
import { ITripData } from './Trip';

export type DiaryData = ReadonlyArray<{
  place?: IPlaceData;
  stay?: IStayData;
  trip?: ITripData;
}>;

export type DiaryPlaceData = ReadonlyArray<{
  place?: IPlaceData;
}>;

export type DiaryUserData = ReadonlyArray<{
  stay?: IStayData;
  trip?: ITripData;
}>;
