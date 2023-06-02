import { Types } from 'mongoose';

import Building from '../models/building.model';

import { IUser } from '../interfaces/IUser';
import { IBuilding, IBuildingModel } from '../interfaces/IBuilding';

import { regionsUA } from '../interfaces/ERegions';

export const createBuilding = async (building: Omit<IBuilding, '_id' | 'createdAt' | 'updatedAt' | 'archivedAt'>) => {
  const newBuilding = new Building(building).save();
  return (await newBuilding)._doc;
};

export const updateBuilding = async (building: IBuilding, changes: Partial<IBuilding>) => {
  return unwrap(await Building.findByIdAndUpdate(building._id, {
    ...changes,
    updatedAt: new Date(),
  }, { new: true }).exec());
};

export const findOneById = async (id: string | Types.ObjectId) =>
  unwrap(await Building.findById(id).exec());

export const findManyBy = async (
  options: {
    user?: IUser,
    isArchived?: boolean,
    regionName?: typeof regionsUA[number],
  } = {},
  sortType: 'asc' | 'desc' = 'desc',
) => {
  const searchOptions: {
    userId?: string;
    regionName?: typeof regionsUA[number];
    archivedAt: null | { $ne: null }; 
  } = {
    archivedAt: null,
  };

  if (options.user) {
    searchOptions.userId = options.user._id;
  }

  if (options.regionName) {
    searchOptions.regionName = options.regionName;
  }

  if (options.isArchived) {
    searchOptions.archivedAt = { $ne: null };
  }

  const results = await Building.find(searchOptions).sort([['createdAt', sortType]]).exec();
  return unwrapMany(results);
}

const unwrap = (entity: IBuildingModel | null) => entity?._doc;
const unwrapMany = (entities: IBuildingModel[]) => entities.map(e => e._doc);

