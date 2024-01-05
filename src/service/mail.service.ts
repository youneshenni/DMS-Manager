import { genSalt, hash } from "bcrypt";
import * as fs from "fs";

export class MailService {
  static mailService = new MailService();
  add = async (data: { email: string; password: string }): Promise<boolean> => {
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    
    const command = `doveadm pw -s SHA512-CRYPT -u ${data.email} -p ${data.password}`;
    try {
      const hashPassword = await this.generateDovecotPassword(data.password);
      // Console.log(stdout);
      const filePath = "docker-data/dms/config/postfix-accounts.cf";

      fs.appendFileSync(
        filePath,
        `${data.email}|{SHA512-CRYPT}${hashPassword}\n`
      );
      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  };
  edit = async (data: {
    email: string;
    newPassword: string;
  }): Promise<boolean> => {
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    try {
      const filePath = "docker-data/dms/config/postfix-accounts.cf";

      const fileContent = fs.readFileSync(filePath, "utf-8");

      const lines = fileContent.split("\n");

      const updatedLines = lines.map(async (line) => {
        if (line.includes("|")) {
          const [email, password] = line.split("|");
          if (email.trim() === data.email) {
            const hashPassword = await this.generateDovecotPassword(data.newPassword);
            return `${email.trim()}|{SHA512-CRYPT}${hashPassword}`;
          }
        }
        return line;
      });

      const updatedContent = updatedLines.join("\n");
      fs.writeFileSync(filePath, updatedContent, "utf-8");

      return true;
    } catch (error) {
      return false;
    }
  };

  getAll = async (): Promise<string[]> => {
    if (process.env.NODE_ENV === "development") {
      return [];
    }
    try {
      const filePath = "docker-data/dms/config/postfix-accounts.cf";

      const fileContent = fs.readFileSync(filePath, "utf-8");

      const lines = fileContent.split("\n");

      const emailAddresses = lines
        .map((line) => line.trim())
        .filter((line) => line.includes("|"))
        .map((line) => line.split("|")[0]);

      return emailAddresses;
    } catch (error) {
      return [];
    }
  };

  delete = async (email: string): Promise<boolean> => {
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    try {
      const filePath = "docker-data/dms/config/postfix-accounts.cf";

      const fileContent = fs.readFileSync(filePath, "utf-8");

      const lines = fileContent.split("\n");

      const updatedLines = lines.filter((line) => {
        if (line.includes("|")) {
          const data = line.split("|")[0].trim();
          return data !== email;
        }

        return true;
      });

      const updatedContent = updatedLines.join("\n");
      fs.writeFileSync(filePath, updatedContent, "utf-8");

      return true;
    } catch (error) {
      return false;
    }
  };

  generateDovecotPassword = async (password: string): Promise<string> => {
    const saltRounds = 12; // You can adjust this value for the desired level of security
    const salt = await genSalt(saltRounds);
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
  };
}

const mailService = new MailService();
export { mailService };
