# How the website and the business system talk to each other

Two things connect them. Both are small on purpose.

```
 Business system (office)                       Website (GitHub Pages)
 ------------------------                       ----------------------
 Website -> Content, Products   -- Publish -->  content/site.json + content/media/
                                                (a commit to this repository; the
                                                 site rebuilds itself in about 2 minutes)

 Website -> Inquiries           <-- message --  forms on /contact/, /dealership/, /support/
                                                POST {api.baseUrl}/api/public/inquiries
```

The website never reads from the business system while a visitor is looking at it. That is why
it stays online, with the content published last, when the office computer is off.

## 1. Publishing content: `content/site.json`

The business system writes the whole file each time. `schemaVersion` is `1`.

| Part | Meaning |
|------|---------|
| `publishedAt`, `publishedBy` | When and by whom (shown nowhere; for the record) |
| `site` | Name, address of the site, founding year, the home page's title and description for search engines, footer wording |
| `api.baseUrl` | The internet address of the business system, without a slash at the end. Empty = not linked: forms use email |
| `contact` | Address, phone, WhatsApp number (empty hides WhatsApp), email, wording of the contact page |
| `social` | Facebook, Instagram, TikTok addresses. Empty ones are not shown |
| `home.hero`, `home.story` | Wording and photo of the top of the home page and of "Our story" |
| `categories[]` | `slug`, `name`, in the order they are shown. A category without products is not shown |
| `products[]` | In the order they are shown: `id`, `slug` (the product's address, never change it once published), `name`, `nameNp`, `category`, `price` (rupees; leave out or `null` to show no price), `pack` (for example "400 g jar"; optional), `image` (a file name in `content/media/`), `description` |
| `dealership` | Wording, the list of benefits, the kinds of business offered in the form |
| `support` | Wording and the questions and answers. An empty list hides "Asked often" |

Photos go into `content/media/` as JPEG, PNG or WebP, any size; the build shrinks them. A photo
that is no longer named in `site.json` should be removed from the folder.

## 2. Receiving messages: `POST /api/public/inquiries`

Sent by the browser of the visitor, as JSON, without cookies.

```json
{
  "type": "customer | dealer | support",
  "name": "Sita Sharma",
  "phone": "9800000001",
  "email": "sita@example.com",
  "subject": "Question about Mango Pickle",
  "message": "…",
  "productSlug": "mango-pickle",

  "businessName": "Ram Kirana Pasal",
  "businessType": "kirana",
  "location": "Bharatpur, Chitwan",

  "boughtAt": "Shop and town",
  "packDetails": "Date or batch on the pack",

  "page": "/contact/",
  "website": "",
  "elapsedMs": 41250
}
```

- Always present: `type`, `name`, `page`, `website`, `elapsedMs`. Everything else only when filled in.
- `dealer` always has `phone`, `businessType`, `location`. `customer` and `support` always have
  `message` and at least one of `phone` and `email`.
- `website` is a box people cannot see. If it is not empty, a robot filled the form.
  `elapsedMs` is how long the form was open; a few hundred milliseconds is a robot too.

Answers the website understands:

| Answer | What the visitor sees |
|--------|-----------------------|
| `201` with `{ "reference": "WEB-000123" }` | "Message sent" and the reference |
| `4xx` with `{ "error": "words for the visitor" }` | Those words above the button; what they typed stays |
| Anything else, or no answer within 12 seconds | "Not sent yet", with the same message ready for email, WhatsApp or phone |

The system must answer the browser's permission question (`OPTIONS`, CORS) for the origin
`https://acharyafoods.com.np`, allowing `POST` and the `Content-Type` header.
