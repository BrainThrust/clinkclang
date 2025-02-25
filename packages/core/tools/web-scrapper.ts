import { Tool } from "./tool";
import { z } from "zod";
import * as puppeteer from 'puppeteer';

export class WebScraperTool implements Tool {
    name = "web_scraper";
    description = "Scrapes full text content from web pages";
    parameters = z.object({
      url: z.string().url().describe("Valid URL of the web page")
    });
  
    private browserPromise: Promise<puppeteer.Browser>;
    private isBrowserClosed = false;
  
    constructor() {
      this.browserPromise = this.initializeBrowser();
    }
  
    private async initializeBrowser(): Promise<puppeteer.Browser> {
      try {
        return await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          defaultViewport: { width: 1280, height: 720 },
          timeout: 30000 // 30s launch timeout
        });
      } catch (error) {
        console.error('Failed to launch browser:', error);
        throw new Error('Browser initialization failed');
      }
    }
  
    async execute(params: z.infer<typeof this.parameters>): Promise<string> {
      const { url } = params;
      let page: puppeteer.Page | null = null;
  
      try {
        const browser = await this.browserPromise;
        if (this.isBrowserClosed) {
          throw new Error('Browser instance has been closed');
        }
  
        page = await browser.newPage();
        page.setDefaultNavigationTimeout(45000);
        page.setDefaultTimeout(20000);
  
        await page.setRequestInterception(true);
        page.on('request', req => 
          ['document', 'script', 'xhr', 'fetch'].includes(req.resourceType()) 
            ? req.continue() 
            : req.abort()
        );
  
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 45000
        });
  
        if (!response || !response.ok()) {
          throw new Error(`Failed to load page: ${response?.status()}`);
        }
  
        await Promise.race([
          page.waitForFunction(
            () => document.body?.innerText?.length > 100,
            { timeout: 15000 }
          ),
          page.waitForSelector('body', { timeout: 15000 })
        ]);
  
        const content = await page.evaluate(this.cleanContent);
        
        if (content.length < 500) {
          throw new Error('Insufficient meaningful content found');
        }
  
        return content.substring(0, 10000);
      } catch (error) {
        console.error(`Scraping failed for ${url}:`, error);
        throw new Error(`Web scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        if (page && !page.isClosed()) {
          await page.close().catch(() => {});
        }
      }
    }
  
    async shutdown() {
      try {
        this.isBrowserClosed = true;
        const browser = await this.browserPromise;
        await browser.close();
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  
    private cleanContent() {
      const removalSelectors = [
        'header', 'footer', 'nav', 'script', 'style',
        '.ad', '.cookie-banner', '.newsletter-signup',
        '.social-share', '.comments', '[role="alert"]'
      ];
  
      removalSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
  
      const contentContainers = [
        'main', 'article', '.content-area',
        '.main-content', '[role="main"]'
      ];
  
      for (const selector of contentContainers) {
        const container = document.querySelector(selector) as HTMLElement;
        if (container?.innerText?.length > 100) {
          return container.innerText.trim();
        }
      }
  
      return document.body?.innerText?.trim() || '';
    }
  }