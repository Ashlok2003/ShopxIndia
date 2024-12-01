import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { SMSContext } from "../interfaces/notification";
import { ServerErrorException } from "../errors/customErrors";


export class TemplateLoader {
    private static templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

    private static loadTemplateSource(templateName: string): string {
        const templatePath = path.resolve(__dirname, `../templates/${templateName}.hbs`);
        return fs.readFileSync(templatePath, "utf-8");
    }

    private static getTemplate(templateName: string): HandlebarsTemplateDelegate | undefined {

        if (!this.templateCache.has(templateName)) {
            const templateSource = this.loadTemplateSource(templateName);
            const compliledTemplate = Handlebars.compile(templateSource);
            this.templateCache.set(templateName, compliledTemplate);
        }

        return this.templateCache.get(templateName);
    }


    public static async renderTemplate<T>(templateName: string, context: T): Promise<string> {
        try {
            const template = this.getTemplate(templateName)!;
            return template(context);
        } catch (error: any) {
            throw new ServerErrorException(`Template rendering failed for ${templateName}: ${error.message}`);
        }
    }

    public static async renderSMSTemplate(context: SMSContext): Promise<string> {
        try {
            const templateName = "sms";
            const template = this.getTemplate(templateName)!;
            return template(context);
        } catch (error: any) {
            throw new ServerErrorException(`Template rendering failed for SMS: ${error.message}`);
        }
    }
}