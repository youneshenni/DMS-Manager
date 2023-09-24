import { genSalt, hash } from "bcrypt";
import * as fs from "fs";
export class MailService {
    static mailService = new MailService();
    add = async (data) => {
        const command = `doveadm pw -s SHA512-CRYPT -u ${data.email} -p ${data.password}`;
        try {
            const hashPassword = await this.generateDovecotPassword(data.password);
            const filePath = "docker-data/dms/config/postfix-accounts.cf";
            fs.appendFileSync(filePath, `${data.email}|{SHA512-CRYPT}${hashPassword}\n`);
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    };
    getAll = async () => {
        try {
            const filePath = "docker-data/dms/config/postfix-accounts.cf";
            const fileContent = fs.readFileSync(filePath, "utf-8");
            const lines = fileContent.split("\n");
            const emailAddresses = lines
                .map((line) => line.trim())
                .filter((line) => line.includes("|"))
                .map((line) => line.split("|")[0]);
            return emailAddresses;
        }
        catch (error) {
            return [];
        }
    };
    delete = async (email) => {
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
        }
        catch (error) {
            return false;
        }
    };
    generateDovecotPassword = async (password) => {
        const saltRounds = 12;
        const salt = await genSalt(saltRounds);
        const hashedPassword = await hash(password, salt);
        return `$6$${salt}$${hashedPassword}`;
    };
}
const mailService = new MailService();
export { mailService };
