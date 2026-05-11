"use server";

import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { marked } from "marked";
import puppeteer from "puppeteer";
import dbConnection from "@/lib/dbConnection";
import ApplicationModel from "@/model/Application";
import type { IApplication } from "@/types";
import TemplateModel from "@/model/Template";

const TEMPLATE_NAME = "StandardTemplate";
const DEFAULT_TEMPLATE = `# Application
**Name:** {{name}}
**Phone:** {{phoneno}}
> {{address}}`;

export const generatePdf = async (data: IApplication): Promise<string> => {
  await dbConnection();
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    await ApplicationModel.create(data);
    
    const templateDoc =
      (await TemplateModel.findOne({ name: TEMPLATE_NAME })) ??
      (await TemplateModel.create({
        name: TEMPLATE_NAME,
        content: DEFAULT_TEMPLATE,
      }));
    const templateSource = templateDoc.content;
    const template = Handlebars.compile(templateSource);
    const filledMarkdown = template(data);

    const htmlContent = marked.parse(filledMarkdown);

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    
    const styledHtml = `
    <html>
      <head><style>body { font-family: Arial; padding: 40px; line-height: 1.6; }</style></head>
      <body>${htmlContent}</body>
    </html>
    `;

    await page.setContent(styledHtml);
    const pdfBuffer = await page.pdf({format: 'A4'});
    await browser.close();
    browser = null;
    
    return (Buffer.from(pdfBuffer).toString("base64")) as string
  } catch (error) {
    console.error("PDF generation error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to generate PDF: ${message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
