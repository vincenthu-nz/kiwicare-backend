import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import * as showdown from 'showdown';
import * as cheerio from 'cheerio';
import { NextFunction } from 'express';

const converter = new showdown.Converter();

@Injectable()
export class MDMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: NextFunction) {
    const { content } = req.body;

    if (content) {
      try {
        const html = converter.makeHtml(content);
        req.body.contentHtml = html;
        req.body.summary = extractTextSummary(html);
      } catch (_) {
        throw new BadRequestException('Invalid markdown format');
      }
    }

    next();
  }
}

/**
 * Convert HTML to plain text summary with max length.
 * Strips HTML tags and entities.
 * @param html - The HTML string to convert.
 * @param maxLength - Maximum summary length.
 * @returns Summary string.
 */
function extractTextSummary(html: string, maxLength = 30): string {
  if (!html) return '';
  const plainText = html.replace(/<[^>]+>|&[^>]+;/g, '').trim();
  return plainText.length <= maxLength
    ? plainText
    : `${plainText.substring(0, maxLength)}...`;
}

/**
 * Generate Table of Contents (TOC) from HTML headings.
 * Adds IDs to headings and returns structured data.
 * @param html - The HTML string to parse.
 */
function getToc(html: string) {
  const $ = cheerio.load(html);
  const headings = [];
  let highestLevel: number | undefined;
  let count = 0;

  $('h1, h2, h3, h4, h5, h6').each(function () {
    const id = `h${count++}`;
    $(this).attr('id', id);

    const level = Number($(this).get(0).tagName.slice(1));
    if (!highestLevel) highestLevel = level;

    headings.push({
      hLevel: level - highestLevel + 1,
      content: $(this).html(),
      id,
    });
  });

  console.log('Generated TOC:', headings);
}

/**
 * Converts a flat heading array to a nested tree structure.
 * @param flatArr - Flat array of heading items.
 * @returns Nested tree structure.
 */
function toTree(flatArr: any[]) {
  const result = [];
  const stack = [];
  let collector = result;

  flatArr.forEach((item) => {
    if (stack.length === 0) {
      stack.push(item);
      collector.push(item);

      item.children = [];
      item.parentCollector = result;

      collector = item.children;
    } else {
      const top = stack[stack.length - 1];

      if (top.hLevel >= item.hLevel) {
        stack.pop();
        stack.push(item);
      }
    }
  });

  return result;
}
