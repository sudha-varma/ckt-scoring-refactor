import mongoose, { SchemaTypes } from "mongoose";
import constants from "../../helpers/constants";
import { venueSchema } from "../venue/model";
import { teamSchema } from "../team/model";

const referenceSchema = new mongoose.Schema(
  {
    feedSource: {
      type: String,
      enum: constants.feedSourceTypes,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const filterSchema = new mongoose.Schema({}, { _id: false, strict: false });

const modelSchema = new mongoose.Schema(
  {
    id : { type : String },
    name: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    format: {
      type: [
        {
          type: String,
          enum: constants.seriesFormatTypes,
          default: "international",
        },
      ],
      required: true,
    },
    filters: {
      type: filterSchema,
    },
    status: {
      type: String,
      enum: constants.seriesLiveStatusTypes,
      default: "upcoming",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: Date.now,
    },
    dateFormat : String,
    feedSource: {
      type: String,
      enum: constants.feedSourceTypes,
      default: "cricketapi",
    },
    matches : {
      type : SchemaTypes.Mixed
    },
    teams : {
      type : SchemaTypes.Mixed
    },
    rounds :{ type : SchemaTypes.Mixed},
    roundsDetails : [String],
    venue : [String],
    references: {
      type: [referenceSchema],
      required: true,
    },
    record_status: {
      type: String,
      enum: constants.statusTypes,
      default: "active",
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    strict : false
  },
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
modelSchema.method({});

/**
 * Statics
 */
modelSchema.statics = {};

/**
 * @typedef Series
 */

export default mongoose.model("Series", modelSchema);
