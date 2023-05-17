import { Types } from 'mongoose';

import Building from '../models/building.model';

import { IUser } from '../interfaces/IUser';
import { IBuilding, IBuildingModel } from '../interfaces/IBuilding';

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

export const findManyByUser = async (user: IUser, isArchived: boolean = true) => {
  const searchOptions: Record<keyof Pick<IBuilding, 'userId' | 'archivedAt'>, any> = {
    userId: user._id,
    archivedAt: null,
  };

  if (!isArchived) {
    searchOptions.archivedAt = { $ne: null };
  }

  const results = await Building.find(searchOptions).exec();
  return unwrapMany(results);
}

const unwrap = (entity: IBuildingModel | null) => entity?._doc;
const unwrapMany = (entities: IBuildingModel[]) => entities.map(e => unwrap(e));
