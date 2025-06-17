import mongoose, { Model, Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";
import { unique } from "next/dist/build/utils";

// user interface
export interface IUser {
    email: string;
    password: string;
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date
}

// user Schema
const userSchema = new Schema<IUser>({
    email: {type: String, required: true, unique: true, trim: true,},
    password: {type: String, required: true, trim: true}
}, { timestamps: true });

// use per hook to hash the password using bcrypt
userSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        // hash the modified password
        this.password = await bcrypt.hash(this.password, 10);
    }
    // if password was never modified, pass the control to next function
    next();
})

// create and export UserModel, check if already created
// method where we tell our resulting User model to be aligned with types is

const User : Model<IUser> = models.User as Model<IUser> || model<IUser>("User", userSchema);

// TODO:  Easy Method
// const User = models.User  || model<IUser>("User", userSchema);

export default User;









