import fetch from 'node-fetch';
import { NextApiHandler } from 'next';
import { Storage } from '../../../utils/Storage';
import { NotionUtil, UnfurlObject } from '../../../utils/NotionUtil';

let storedObject: { storage?: Storage; notion?: NotionUtil } = {};

export const SlackEvents: NextApiHandler = async (req, res) => {
  if (req.method === 'POST' && req.body) {
    // Event subscription - https://api.slack.com/events/url_verification
    if (req.body.type === 'url_verification') {
      res.statusCode = 200;
      return res.json(req.body.challenge);
    }

    // Unfurl event - https://api.slack.com/reference/messaging/link-unfurling
    if (req.body.event && req.body.event.type === 'link_shared') {
      try {
        if (!storedObject.storage) storedObject.storage = new Storage();
        if (!storedObject.notion) storedObject.notion = new NotionUtil();
        const { storage, notion } = storedObject;
        const unfurls: { [key: string]: UnfurlObject } = {};
        for (const link of req.body.event.links as Array<{ url: string; domain: string }>) {
          if (link.domain === 'notion.so') {
            const cache = await storage.get(link.url);
            if (cache) {
              console.log('cache');
              const res = cache;
              const unfurl = await NotionUtil.toUnfurl(res);
              unfurls[link.url] = unfurl;
            } else {
              console.log('fetch');
              const res = await notion.fetch(link.url);
              const unfurl = await NotionUtil.toUnfurl(res);
              unfurls[link.url] = unfurl;
              await storage.put(link.url, res);
            }
          }
        }
        const { event, token } = req.body;
        const response = await fetch('https://slack.com/api/chat.unfurl', {
          method: 'POST',
          body: JSON.stringify({ channel: event.channel, token, ts: event.message_ts, unfurls }),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
          },
        });
        const data = (await response.json()) as { ok: boolean };
        if (data.ok) {
          res.statusCode = 200;
          return res.json({ ok: true });
        } else {
          console.log(unfurls, data);
          res.statusCode = 500;
          return res.json(data);
        }
      } catch (error) {
        console.error(error);
        res.statusCode = 500;
        return res.json({ ok: false, error });
      }
    }
  }

  res.statusCode = 404;
  res.json({ ok: false, error: 'event_not_found' });
};

export default SlackEvents;
