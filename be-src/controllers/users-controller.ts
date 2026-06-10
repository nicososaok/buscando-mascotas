import { Auth, User } from "../models/models";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

async function signUp(data: { name: string; email: string; password: string }) {
   try {
      const existingAuth = await Auth.findOne({ where: { email: data.email } });
      if (existingAuth) {
         return { message: "User already existed", id: existingAuth.dataValues.userId };
      }

      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
      const user = await User.create({
         name: data.name,
         email: data.email
      });

      const auth = await Auth.create({
         email: data.email,
         password: hashedPassword,
         userId: user.dataValues.id
      });

      return { message: "New User created", id: user.dataValues.id };
   } catch (error) {
      console.error("Error en signUp controller:", error);
      return { message: "Something went wrong", error: JSON.stringify(error) };
   }
}

async function getToken(data: { email: string; password: string }) {
   const response = {
      message: "Something went wrong",
      token: "",
   };

   if (!SECRET) {
      response.message = "Secret missing";
      return response;
   }

   try {
      const auth = await Auth.findOne({ where: { email: data.email } });

      if (!auth) {
         response.message = "Wrong email or password";
         return response;
      }

      const match = await bcrypt.compare(data.password, auth.dataValues.password);

      if (match) {
         const token = jwt.sign({ userId: auth.dataValues.userId }, SECRET, { expiresIn: "1d" });
         return { message: "Ok", token };
      } else {
         response.message = "Wrong email or password";
         return response;
      }
   } catch (error) {
      response.message += ` error: ${JSON.stringify(error)}`;
      return response;
   }
}

async function getUserData(id: number) {
   try {
      const user = await User.findByPk(id);
      return user ? user.dataValues : null;
   } catch (error) {
      console.error("Error en getUserData:", error);
      return null;
   }
}

async function updateUserData(data: { id: number; name?: string; location?: string }) {
   try {
      const user = await User.findByPk(data.id);
      if (user) {
         await user.update(data);
         return { success: true };
      }
      return { success: false, error: "User not found" };
   } catch (error) {
      return { success: false, error };
   }
}

async function updateUserPassword(data: { id: number; password: string; newPassword: string }) {
   try {
      const auth = await Auth.findOne({ where: { userId: data.id } });
      if (!auth) return { passwordCheck: false, error: "Auth missing" };

      const match = await bcrypt.compare(data.password, auth.dataValues.password);

      if (match) {
         const newHashedPassword = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
         await auth.update({ password: newHashedPassword });
         return { passwordCheck: true };
      } else {
         return { passwordCheck: false, message: "Contraseña actual incorrecta" };
      }
   } catch (error) {
      return { passwordCheck: false, error };
   }
}

export { signUp, getToken, getUserData, updateUserData, updateUserPassword };