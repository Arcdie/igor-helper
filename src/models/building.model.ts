import mongoose, { Types } from 'mongoose';

import { IBuilding, IBuildingModel } from '../interfaces/IBuilding';

const modelSchema: Record<keyof Omit<IBuilding, '_id'>, any> = {
  userId: {
    type: Types.ObjectId,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  regionName: {
    type: String,
    required: true,
  },

  listEquipment: {
    type: String,
    required: true,
  },

  lat: {
    type: String,
    required: true,
  },

  lng: {
    type: String,
    required: true,
  },

  isReserved: {
    type: Boolean,
    required: true,
  },

  comment: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: Date,
  archivedAt: Date,
};

const Building = new mongoose.Schema<IBuildingModel>(modelSchema, { versionKey: false });
export default mongoose.model<IBuildingModel>('Building', Building, 'buildings');
