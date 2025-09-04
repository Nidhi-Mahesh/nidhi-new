
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Troubleshooting

### Media Upload / CORS Error

If you are seeing `CORS policy` errors in your browser console when trying to upload or view images in the Media Library, it means your Firebase Storage bucket needs to be configured to allow requests from the web.

**To fix this, run the following command from your terminal:**

You will need to have the Google Cloud CLI (`gcloud`) installed and authenticated.

```bash
gcloud storage buckets update gs://modern-chyrp.appspot.com --cors-file=./storage.cors.json
```

After running this command, refresh your browser tab, and the media library should work correctly.
