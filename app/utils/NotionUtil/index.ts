import url from 'url';
import { Client as NotionClient } from '@notionhq/client';
import {
  BlockObjectResponse,
  CommentObjectResponse,
  DatabaseObjectResponse,
  ListBlockChildrenResponse,
  PageObjectResponse,
  RichTextItemResponse,
  UserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

const toId = (key: string) => {
  return key
    .replace(/.*\/(.+$)/, '$1')
    .replace(/.*-([0-9a-z]{32})$/, '$1')
    .replace(/^([0-9a-z]{8})([0-9a-z]{4})([0-9a-z]{4})([0-9a-z]{4})([0-9a-z]{12})$/, '$1-$2-$3-$4-$5');
};

export type RetrieveTarget = {
  pageId: string;
  blockId?: string;
  commentId?: string;
};

export type RetrieveResponse = {
  retrieved?: 'block' | 'page' | 'comment' | 'database';
  user?: UserObjectResponse;
  block?: BlockObjectResponse;
  page?: PageObjectResponse;
  comment?: CommentObjectResponse[];
  database?: DatabaseObjectResponse;
  children?: ListBlockChildrenResponse;
};

export type UnfurlObject = {
  color?: string;
  author_icon?: string;
  author_name?: string;
  author_link?: string;
  title?: string;
  title_link?: string;
  thumb_url?: string;
  fields?: Array<{ value: string; short?: boolean }>;
  footer?: string;
  footer_icon?: string;
  ts?: number;
};

export class NotionUtil {
  static toRetrieve = (source: string) => {
    const { pathname, query, hash } = url.parse(source, true);
    const target: RetrieveTarget = { pageId: '' };
    if (pathname) target.pageId = toId(pathname);
    if (query.p) target.pageId = toId(query.p as string);
    if (hash) target.blockId = toId(hash.replace(/^#/, ''));
    if (query.d) target.commentId = toId(query.d as string);
    return target;
  };

  static toUnfurl = async (retrieves: RetrieveResponse): Promise<UnfurlObject> => {
    const { page, database, comment, block, children } = retrieves;
    // if (user) {
    const target = page ? page : database ? database : undefined;
    if (target) {
      const icon = (() => {
        if (target.icon?.type === 'file') {
          return target.icon.file.url;
        } else if (target.icon?.type === 'emoji') {
          const code = Array.from(target.icon.emoji)
            .map((c: string) => c.codePointAt(0)?.toString(16))
            .join('-');
          return `https://a.slack-edge.com/production-standard-emoji-assets/14.0/apple-large/${code}@2x.png`;
        } else {
          return 'https://www.notion.so/images/favicon.ico';
        }
      })();
      const thumb = (() => {
        if (target.cover?.type === 'external') {
          const source = target.cover?.external.url;
          if (/^https?:\/\/images\.unsplash\.com/.test(source)) {
            return `${source}${/\?/.test(source) ? '&' : '?'}w=600`;
          }
          return source;
        } else {
          return target.cover?.file.url;
        }
      })();
      const summary = (() => {
        if (comment) {
          return comment[0].rich_text
            .map(({ plain_text }) => plain_text)
            .join('')
            .replace(/\n/g, ' ');
        } else if (block) {
          // @ts-ignore
          return block[block.type].rich_text[0].plain_text;
        } else if (page) {
          return children?.results
            .map((result) => {
              // @ts-ignore
              const texts = result[result.type].rich_text;
              return Array.isArray(texts) ? texts.map((t) => t.plain_text.trim()).join(' ') : '';
            })
            .join(' ')
            .replace(/\n/g, '');
        } else if (database) {
          return database.description
            .map((t) => t.plain_text.trim())
            .join(' ')
            .replace(/\n/g, '');
        } else {
          return '';
        }
      })();
      const title = (() => {
        if (page) {
          const { title } = Object.values(page.properties).find((prop) => prop.type === 'title') as {
            title: Array<RichTextItemResponse>;
          };
          return title.length > 0 ? title.map(({ plain_text }) => plain_text).join('') : 'Untitled';
        } else if (database) {
          const { title } = database;
          return title.length > 0 ? title.map(({ plain_text }) => plain_text).join('') : 'Untitled';
        } else {
          return 'Untitled';
        }
      })();
      return {
        color: '#000000',
        author_icon: icon,
        author_name: 'notion.so',
        author_link: target.url,
        title: title,
        title_link: target.url,
        thumb_url: thumb,
        fields: [
          {
            value: summary ? (summary.length > 130 ? `${summary.slice(0, 127)}...` : summary) : '',
            short: false,
          },
        ],
        // footer: `Created by ${user.name}`,
        // footer_icon: user.avatar_url ? user.avatar_url : undefined,
        ts: +new Date(target.created_time),
      };
    }
    // }
    return {};
  };

  private notion: NotionClient;

  constructor(token?: string) {
    this.notion = new NotionClient({ auth: `${token || process.env.NOTION_TOKEN}` });
  }

  fetch = async (url: string) => {
    const { pageId, commentId, blockId } = NotionUtil.toRetrieve(url);
    const res: RetrieveResponse = {};

    // @ts-ignore
    const block: BlockObjectResponse = await this.notion.blocks.retrieve({ block_id: pageId });

    if (block.type === 'child_page') {
      // @ts-ignore
      res.page = await this.notion.pages.retrieve({ page_id: pageId });
      if (res.page) {
        res.children = await this.notion.blocks.children.list({ block_id: pageId });
      }
      res.retrieved = 'page';
    }

    if (block.type === 'child_database') {
      // @ts-ignore
      res.database = await this.notion.databases.retrieve({ database_id: pageId });
      res.retrieved = 'database';
    }

    if (blockId) {
      // @ts-ignore
      res.block = await this.notion.blocks.retrieve({ block_id: blockId });
      res.retrieved = 'block';
    }

    if (commentId) {
      const comment = await this.notion.comments.list({ block_id: blockId || pageId });
      res.comment = comment.results.filter((c) => c.discussion_id === commentId);
      res.retrieved = 'comment';
    }

    return res;
  };

  fetchUser = async (id: string) => {
    const res = await this.notion.users.retrieve({ user_id: id });
    return res;
  };
}
