# Vivian Igbokwe | Creative Portfolio

This package contains the existing portfolio design plus a Sveltia CMS editing dashboard. The dashboard is served at `/admin/` after deployment.

## What the editor can manage
- Main profile photo and About photo
- Project entries, descriptions, cover images and optional project videos
- Testimonials
- Uploaded assets stored in `assets/uploads/` in the GitHub repository

## One-time setup for a NEW GitHub repository
1. Create a new GitHub repository. A public repository is simplest for free static hosting, but choose private if you prefer; GitHub's own plan limits apply.
2. Upload the CONTENTS of this folder to the ROOT of that new repository. The repository root should directly contain `index.html`, `admin`, `assets`, `content`, `netlify.toml` and `success.html`. Do not upload the outer `vivian-creative-portfolio` folder as an extra nested layer.
3. Open `admin/config.yml` and replace `YOUR_GITHUB_USERNAME/YOUR_NEW_REPOSITORY` with your actual GitHub username and new repository name. This is a one-time setting.
4. Connect the new repository to a new Netlify site, with publish directory `.` and no build command. Do not change or delete your existing live Netlify site.
5. After deployment, open `/admin/`. Choose **Sign in with Token** and create a GitHub fine-grained personal access token limited to this new repository. Grant **Contents: Read and write**. GitHub Metadata read access is added automatically. Never share the token or paste it into a website file.

## Editing
In the dashboard, open **Portfolio Content → Website Content**. Upload profile photos, add/edit projects, attach an optional video to a project, and manage testimonials. Save/publish the entry. Sveltia CMS commits the changes to GitHub; Netlify rebuilds the public site when deployment is available.

## Important
- Sveltia CMS is open-source and has no monthly CMS subscription. It is currently in beta.
- GitHub and Netlify have their own free-plan limits and policies.
- Uploaded videos are stored in the Git repository. Keep video files reasonably small; GitHub is not intended for large video hosting.
- The CMS token gives access to the selected repository. Keep it private and sign out on shared devices.
- The existing website files and design are retained. This package does not change your currently published website until you deploy it.
