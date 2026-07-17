# Later Implementation — deferred ideas, not needed for the deadline build

(Based on a theory learned from HelloInterview/YT)
Things intentionally *not* built into the current MVP, kept here so they don't get lost or accidentally re-proposed as if new.

---

## 1. Signed upload signature for Cloudinary (replace the unsigned preset)

**Status:** deferred — current build uses the unsigned preset flow (`requirements/cloudinary-setup.md`). This is a learning exercise for after submission, not a rubric requirement.

### How we got here (history)

Three designs came up while setting up image upload for `/items/add`, in this order:

1. **Signed server-proxy** (first draft of `cloudinary-setup.md`): client sends the file to our own `POST /api/upload` route; the route reads the full file into memory and re-uploads it to Cloudinary using the API secret. Gives real auth control (only logged-in users can upload) but the backend handles every byte of every image twice — once in, once back out to Cloudinary.
2. **Unsigned preset, client-direct** (current implementation): browser uploads straight to Cloudinary with an unsigned preset, zero backend involvement. No bandwidth cost to us at all, but also no auth check on who can upload — anyone who finds the preset name could POST to the Cloudinary account directly. Accepted as a fine tradeoff for a graded class project on a same-day deadline.
3. **Signed upload signature** (this deferred idea, from a hellointerview.com explanation of the S3 presigned-URL pattern): the backend never touches the file bytes, but still gates who's allowed to upload.

### The pattern

```
Client → POST /api/upload/sign  (protected: server checks the JWT cookie)
       ← { signature, timestamp, apiKey, cloudName }
         (server computes `signature` from a subset of upload params + the
          API secret, using Cloudinary's signing algorithm — never sends
          the secret itself to the client)

Client → POST https://api.cloudinary.com/v1_1/<cloud>/image/upload
         (file + signature + timestamp + api_key, sent directly to Cloudinary)
       ← { secure_url, public_id }
```

The server's only job is deciding *whether* to hand out a signature (i.e. "is this user logged in") — it never sees or forwards the actual image data. That's the piece that was missing in both earlier designs: #1 solved auth but paid bandwidth twice; #2 solved bandwidth but dropped auth. This solves both, at the cost of one more round-trip and understanding Cloudinary's signature algorithm (SHA-1 over sorted params + secret).

### Why it's deferred, not built now

- Not a rubric requirement — `requirements/requirement.md` doesn't ask for signed uploads, just working image display.
- Real added complexity: a signing endpoint, matching signed params exactly between client and server, and testing that mismatched params correctly get rejected by Cloudinary.
- The unsigned-preset tradeoff (open upload endpoint) is a known, accepted risk for this project's scope and timeline — not worth spending deadline time closing.

### When to pick this back up

After submission, as a hands-on exercise in the presigned-URL pattern generally (same idea applies to S3, GCS signed URLs, Azure SAS tokens — Cloudinary's signed uploads are one concrete, low-setup way to practice it before touching raw S3 signing).
