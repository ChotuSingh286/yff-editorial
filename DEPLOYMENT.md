# Making your Youth Finance First workspace a permanent link

This is a beginner's guide. Follow it top to bottom and you will end up with a
permanent web address (for example `https://yff-editorial.vercel.app`) that you
and your writers can open from any device, at any time.

You will do four things:

1. Put the code on GitHub.
2. Create a free always-on database.
3. Connect the app to Vercel.
4. Load your starting data.

---

## Before you start

You need five things. Create them in this order.

1. **The project files on your own computer.**
   Download `yff-editorial.zip` from the workspace and double-click it to unzip.
   You get a folder containing 114 files. That folder *is* the whole website.
   It already excludes everything you must not upload (`node_modules`, `.next`,
   `data`, and the private `.env` file).

2. **Node.js on your computer** — <https://nodejs.org>
   Click the big green button that says **LTS** and install it with all defaults.
   You need this to run two commands in Step 4. Nothing else.

3. **GitHub Desktop** — <https://desktop.github.com>
   A free app that puts your files on GitHub by clicking buttons. No typing commands.

4. **A Vercel account** — <https://vercel.com/signup>
   Choose **"Continue with GitHub"** — this is important, because it lets Vercel
   see your repository automatically.

5. **A Neon account** — <https://neon.com>
   This holds your data permanently. Free at the size this app uses.

Allow about 30–40 minutes in total. Nothing here costs money.

---

## Step 1 — Put the code on GitHub

1. Open <https://github.com/new>.
2. **Repository name:** `yff-editorial`
3. Choose **Private**. (Your articles and feedback are private information.)
4. Leave every other checkbox unticked.
5. Click **Create repository**.

GitHub now shows you an empty repository page with some commands. Keep that page
open.

You will use GitHub Desktop for this. No commands.

### 1A. Connect the app to your GitHub account

1. Open **GitHub Desktop**.
2. Click **Sign in to GitHub.com** and follow the prompts.
3. When it asks, click **Finish** on the "Configure Git" screen. Your name and
   email can stay as they are.

### 1B. Bring your empty repository onto your computer

1. In GitHub Desktop, click **File → Clone repository…**
2. Click the **URL** tab at the top.
3. In the first box, paste your repository address. It looks like this:
   `https://github.com/YOUR-USERNAME/yff-editorial.git`
4. In **Local path**, click **Choose…** and pick somewhere easy, like
   `Documents`. The app adds the folder name for you.
5. Click **Clone**.

You now have an empty folder on your computer that is connected to GitHub.

### 1C. Copy the project files into it

1. Open the folder you unzipped in Step 1 (the 114 files).
2. Select **everything** inside it.
   - **Windows:** press `Ctrl` + `A`.
   - **Mac:** first press `Cmd` + `Shift` + `.` to reveal hidden files — this
     step matters, otherwise `.gitignore` and `.env.example` get left behind —
     then press `Cmd` + `A`.
3. Copy them (`Ctrl`+`C` or `Cmd`+`C`).
4. Open the empty folder from Step 1B and paste everything in
   (`Ctrl`+`V` or `Cmd`+`V`). If your computer asks about replacing files,
   choose **Replace**.

### 1D. Send them to GitHub

1. Go back to **GitHub Desktop**. It now shows a long list of changed files.
   That is correct — it is showing you all 114 files.
2. In the box at the bottom left, type:
   `First version`
3. Click the blue **Commit to main** button.
4. Click **Push origin** at the top.

> **Check it worked:** go back to your repository page on github.com and
> refresh. You should see folders such as `src`, `scripts`, and `public`, and a
> file called `package.json`. If you can see `package.json`, you did it right.

### Important: secrets stay out of GitHub

This project ships with a `.gitignore` file that already excludes `.env` and the
`data/uploads` folder. Your passwords and database address are never uploaded.

---

## Step 2 — Create your permanent database (Neon)

Your data must live somewhere that stays awake even when nobody is using the
site. Neon is a free PostgreSQL service made for exactly this.

1. Go to <https://neon.com> and sign in.
2. Click **Create project**.
3. **Project name:** `yff-editorial`
4. **Postgres version:** leave the default.
5. Click **Create project**.

Neon now shows you a **Connection string**. It looks something like:

```
postgresql://neondb_owner:AbC123xyz@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

6. Click **Copy** and paste it into a text file for a moment. You need it twice.

> **Keep this private.** Anyone who has it can read your database.

---

## Step 3 — Connect the app to Vercel

1. Go to <https://vercel.com> and sign in with GitHub.
2. Click **Add New… → Project**.
3. Find `yff-editorial` in the list and click **Import**.
   If you cannot see it, click **Adjust GitHub App Permissions** and allow Vercel
   to see the repository.
4. Vercel asks about settings. Leave everything as it is — Vercel already knows
   this is a Next.js project.
5. Open the **Environment Variables** section. This is where you put your private
   settings. Add these three, one at a time:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the Neon connection string you copied |
   | `AUTH_SECRET` | a long random password (see below) |
   | `UPLOAD_DIR` | `/tmp/uploads` |

6. To make an `AUTH_SECRET`, run this in your terminal and copy the result:

   ```bash
   openssl rand -base64 32
   ```

   If you do not have `openssl`, type 40 or more random characters by hand. It
   just needs to be long and unguessable.

7. Make sure **all three** variables are set for **Production**, **Preview**, and
   **Development**.
8. Click **Deploy**.

Vercel builds the app for about two minutes. When it finishes it shows
**"Congratulations!"** and gives you a permanent link such as
`https://yff-editorial.vercel.app`.

> **This is your permanent link.** It stays live and updates every time you push
> new code to GitHub.

### Click that link now — you will see a sign-in page

That is correct. Nobody can see your articles without an account. Before you can
sign in, you need to create your tables and your starting data, which is the next
step.

---

## Step 4 — Create your tables and starting data

Your database at Neon is empty right now. You fill it from your own computer.

1. In your terminal, make sure you are in the project folder.
2. Open the `.env` file on your computer and set `DATABASE_URL` to the **same**
   Neon connection string. (You will delete this local copy afterwards.)
3. Run these commands one at a time:

   ```bash
   npx drizzle-kit push
   npx tsx scripts/seed.ts
   ```

   The first command creates all the tables. The second one creates your
   administrators, writers, sample articles, feedback, history, and the current
   cycle.

4. Now open your permanent link and sign in with:

   | Role | Email | Password |
   | --- | --- | --- |
   | Administrator | `admin@youthfinancefirst.com` | `YFFAdmin!2026` |
   | Administrator | `editor@youthfinancefirst.com` | `YFFEditor!2026` |
   | Writer | `ava.chen@youthfinancefirst.com` | `YFFWriter!2026` |
   | Writer | `elijah.brooks@youthfinancefirst.com` | `YFFWriter!2026` |
   | Writer | `mila.jones@youthfinancefirst.com` | `YFFWriter!2026` |
   | Writer | `noah.patel@youthfinancefirst.com` | `YFFWriter!2026` |

> **Change these passwords before sharing the link with anyone.** See
> "Changing passwords" below.

5. You do **not** need to delete your local `.env`. The project's `.gitignore`
   file blocks it from ever being uploaded to GitHub, so it stays only on your
   computer. Keeping it means you can run database commands again later without
   re-pasting anything.

---

## Step 5 — Turn on permanent file storage

Articles you upload are saved as files. Free hosting like Vercel does **not**
keep files between restarts, so for a permanent site you need a cloud store for
them.

The app is already written so this is a small change: it uses one adapter object
for every save, read, and delete.

### Recommended: Vercel Blob

1. In your Vercel project, open the **Storage** tab.
2. Click **Create Database → Blob**.
3. Name it `yff-uploads`.
4. Vercel adds a `BLOB_READ_WRITE_TOKEN` environment variable automatically.
5. Install the helper in your project:

   ```bash
   npm install @vercel/blob
   ```

6. Open `src/lib/storage.ts` and add a second adapter that uses the token, then
   point `localFileStorage` at it. The file already contains the interface you
   need to match:

   ```ts
   export interface FileStorageAdapter {
     save(storageKey: string, contents: Uint8Array): Promise<void>;
     read(storageKey: string): Promise<Buffer>;
     remove(storageKey: string): Promise<void>;
   }
   ```

   Keep using the existing UUID `storageKey` values, so nothing else in the app
   changes — not the database, not the pages, not the download links.

If you would rather use Azure Blob Storage or Amazon S3, the steps are the same:
write one adapter object with those three methods, and use it in place of
`localFileStorage` in `src/app/api/articles/route.ts`,
`src/app/api/files/[id]/preview/route.ts`, and
`src/app/api/files/[id]/download/route.ts`.

> Until you do this step, uploads still work, but files can disappear after a
> restart. Do this before your team starts uploading real articles.

---

## Step 6 — Changing passwords

Passwords are stored securely (bcrypt hashes), so there is no "edit password"
screen in the app. To set new ones, run one command per person from your project
folder, with your Neon `DATABASE_URL` in your local `.env`:

```bash
npx tsx scripts/set-password.ts admin@youthfinancefirst.com 'YourNewLongPassword1!'
```

Use a long, unique password for every person, and share each one privately with
that person only.

---

## Step 7 — Adding your real team

1. Sign in as an administrator.
2. On the **Articles** page, click **Add writer**.
3. Enter their name, email, and a password of at least 12 characters.
4. Tell the writer their email and password privately. They sign in at your
   permanent link and can then upload their own articles and update their own
   cycle progress.

Archive a writer from the same dialogue when they leave. Their articles and
history stay in the backlog forever.

---

## Step 8 — A permanent address of your own (optional)

Your link is `something.vercel.app`. To use your own domain, such as
`editorial.youthfinancefirst.com`:

1. Buy the domain, or use one you already own.
2. In Vercel, open **Project → Settings → Domains**.
3. Type your domain and click **Add**.
4. Vercel shows you DNS records. Copy them into your domain provider's DNS page.
5. Wait for the DNS check to turn green (this can take up to an hour).

After that, both addresses work, and the connection uses HTTPS automatically.

---

## Everyday use afterwards

| What you want | What you do |
| --- | --- |
| Change something in the app | Edit the code, `git add .`, `git commit -m "…"`, `git push`. Vercel updates the live site in about a minute. |
| See if the site is healthy | Visit `https://your-link/api/health`. It should say `{"ok":true}`. |
| Back up your data | In Neon, use **Project → Export data** or schedule a dump. Do this regularly. |
| Look up who changed what | Every upload, feedback change, checklist change, timer change, and cycle rollover is recorded in the `audit_logs` table. |
| Remove a test writer | Sign in as an administrator, click **Edit** on the writer, then **Archive writer**. |

---

## Troubleshooting

**I open my link and see a sign-in page, then my password does not work.**
You have not run Step 4 yet, or you ran it against a different database. Check
that the `DATABASE_URL` in your local `.env` matches the one in Vercel.

**The site says "Invalid environment configuration".**
One of your three environment variables is missing or too short in Vercel. Go to
**Project → Settings → Environment Variables** and compare them with Step 3. Then
**Redeploy**.

**Vercel built fine but pages show an error.**
Open **Project → Deployments → latest → Functions/Logs** to read the error. The
most common cause is a `DATABASE_URL` typo.

**My uploaded article disappeared.**
You have not done Step 5 yet. Uploads are stored on the server disk, which is
cleared on free hosting.

**I pushed to GitHub but the live site did not change.**
Open **Project → Deployments** and check whether the latest build succeeded. If it
failed, the previous version stays online and the error is shown there.

---

## Security checklist before you share the link

- [ ] Changed both administrator passwords
- [ ] Changed every writer password
- [ ] `.env` is not on GitHub (it is ignored by default)
- [ ] `AUTH_SECRET` is a long random value and is not written anywhere else
- [ ] Cloud file storage is enabled (Step 5)
- [ ] Database backups are scheduled in Neon
