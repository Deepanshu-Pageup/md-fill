'use server'
import dbConnection from "@/lib/dbConnection";
import TemplateModel from "@/model/Template";

export async function getTemplate(templateName: string) {
    await dbConnection();
    let template = await TemplateModel.findOne({
        name: templateName,
    });

    if(!template) {
        const defaultTemplate = `# Application\n**Name:** {{name}}\n**Phone:** {{phone}}\n> {{address}}`;
        template = await TemplateModel.create({
            name: templateName,
            content: defaultTemplate,
        });
    };

    return template.content;
};

export async function saveTemplate(templateName: string , newContent: string){
    await dbConnection();

    await TemplateModel.findOneAndUpdate(
        {name: templateName},
        {content: newContent},
        {upsert: true},
    );
    return true;
}