"use server";

import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { marked } from "marked";
import puppeteer from "puppeteer";
import dbConnection from "@/lib/dbConnection";
import ApplicationModel from "@/model/Application";
import type { IApplication } from "@/types";

export const generatePdf = async (data: IApplication): Promise<string> => {
  await dbConnection();
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    await ApplicationModel.create(data);
    const candidateTemplatePaths = [
      path.join(process.cwd(), "templates", "template.md"),
      path.join(process.cwd(), "templates", "application.md"),
      path.join(process.cwd(), "src", "templates", "application.md"),
    ];
    const templatePath = candidateTemplatePaths.find((p) => fs.existsSync(p));
    if (!templatePath) {
      throw new Error(`Template file not found. Checked: ${candidateTemplatePaths.join(", ")}`);
    }
    const templateSource = fs.readFileSync(templatePath, "utf-8");

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
