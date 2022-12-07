import { NotionUtil } from '..';

describe('NotionUtil', () => {
  describe('summarize page in page', () => {
    const notion = new NotionUtil('secret_o23GgVUAWskM60bbOJNjgcQ1VKo3W0NtIJ7VS0lJBZI');

    // test('test', async () => {
    //   const url = 'https://www.notion.so/pixiv/12-7-007ee3b66c2f4e31b8109538b0596eac#a736bf1a359c4573b9a42c47d6d6c44e';
    //   const res = await notion.fetch(url);
    //   const unfurl = await NotionUtil.toUnfurl(res);
    //   console.log(unfurl);
    // });

    test('fetch notion', async () => {
      const url = 'https://www.notion.so/0f229b9c99d94219b0f63babb2ff6fa0';
      const res = await notion.fetch(url);
      expect(res.retrieved).toBe('page');

      const unfurl = await NotionUtil.toUnfurl(res);
      expect(unfurl.color).toBe('#000000');
      expect(unfurl.author_name).toBe('notion.so');
      expect(unfurl.author_link).toBe(url);
      expect(unfurl.author_link).toBe(unfurl.title_link);
      expect(Array.isArray(unfurl.fields)).toBeTruthy();
      expect(unfurl.fields?.length).toBeGreaterThan(0);
    });

    test('fetch page opend from database', async () => {
      const url = 'https://www.notion.so/cbe23211b7374a509046de44115cc68c?p=449a941d64d046b7b19e5aaf463536d2&pm=s';
      const res = await notion.fetch(url);
      expect(res.retrieved).toBe('page');

      const unfurl = await NotionUtil.toUnfurl(res);
      expect(unfurl.color).toBe('#000000');
      expect(unfurl.author_name).toBe('notion.so');
      url.split('?p=');
      expect(unfurl.author_link).toBe(url.replace(/.+\?p=(.+?)&.+/, 'https://notion.so/$1'));
      expect(unfurl.author_link).toBe(unfurl.title_link);
      expect(Array.isArray(unfurl.fields)).toBeTruthy();
      expect(unfurl.fields?.length).toBeGreaterThan(0);
    });

    test('fetch database', async () => {
      const url = 'https://www.notion.so/36b008eb980741e1a757f19a4ef1cc35?v=c84be15357b7425a9e4d4498c48d6c8f';
      const res = await notion.fetch(url);
      expect(res.retrieved).toBe('database');

      const unfurl = await NotionUtil.toUnfurl(res);
      expect(unfurl.color).toBe('#000000');
      expect(unfurl.author_name).toBe('notion.so');
      expect(unfurl.author_link).toBe(url.split('?')[0]);
      expect(unfurl.author_link).toBe(unfurl.title_link);
      expect(Array.isArray(unfurl.fields)).toBeTruthy();
      expect(unfurl.fields?.length).toBeGreaterThan(0);
    });

    test('fetch hash block', async () => {
      const url = 'https://www.notion.so/449a941d64d046b7b19e5aaf463536d2#6fdd2fa1cabc4905937f85a60d325a0b';
      const res = await notion.fetch(url);
      expect(res.retrieved).toBe('block');

      const unfurl = await NotionUtil.toUnfurl(res);
      expect(unfurl.color).toBe('#000000');
      expect(unfurl.author_name).toBe('notion.so');
      expect(unfurl.author_link).toBe(url.split('#')[0]);
      expect(unfurl.author_link).toBe(unfurl.title_link);
      expect(Array.isArray(unfurl.fields)).toBeTruthy();
      expect(unfurl.fields?.length).toBeGreaterThan(0);
    });

    test('fetch discussion', async () => {
      const url =
        'https://www.notion.so/pixiv-e578f775efaf4d96964d65e37616b575?d=ef7faba1a9ee4fa78a3b92b6f429fe6a#9e42de346eca4fdfb747dccd04c7cf1a';
      const res = await notion.fetch(url);
      expect(res.retrieved).toBe('comment');

      const unfurl = await NotionUtil.toUnfurl(res);
      expect(unfurl.color).toBe('#000000');
      expect(unfurl.author_name).toBe('notion.so');
      expect(unfurl.author_link).toBe(url.split('?')[0]);
      expect(unfurl.author_link).toBe(unfurl.title_link);
      expect(Array.isArray(unfurl.fields)).toBeTruthy();
      expect(unfurl.fields?.length).toBeGreaterThan(0);
    });
  });
});
