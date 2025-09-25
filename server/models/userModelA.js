import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const Schema = mongoose.Schema;
const userSchemaA = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["owner", "client"],
    default: "client",
  },
});

//statiškas signup metodas (mano)
userSchemaA.statics.signup = async function (email, password) {
  //validation
  if (!email || !password) {
    throw Error("Visi laukeliai privalomi");
  }
  if (!validator.isEmail(email)) {
    throw Error("El. paštas nėra tinkamas");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Slaptažodis per silpnas");
  }

  const exists = await this.findOne({ email });
  if (exists) {
    throw Error("El. paštas jau naudojamas");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await this.create({ email, password: hash });
  return user;
};

//statiškas login metodas(mano)
userSchemaA.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("Visi laukeliai yra privalomi");
  }
  const user = await this.findOne({ email });
  if (!user) {
    throw Error("El. paštas neteisingas");
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Neteisingas slaptažodis");
  }
  return user;
};

export default mongoose.model("User", userSchemaA);
